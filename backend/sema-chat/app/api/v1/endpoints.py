"""
API v1 endpoints for Sema Chat API
"""

import time
from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, Query, WebSocket, WebSocketDisconnect
from sse_starlette.sse import EventSourceResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

from ...models.schemas import (
    ChatRequest, ChatResponse, ConversationHistory,
    HealthResponse, ModelInfo
)
from ...services.chat_manager import get_chat_manager
from ...services.model_manager import get_model_manager
from ...services.model_backends.base import ModelNotLoadedError, GenerationError
from ...core.config import settings
from ...core.logging import get_logger

# Initialize router and rate limiter
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = get_logger()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()


@router.post("/chat", response_model=ChatResponse)
@limiter.limit(f"{settings.rate_limit}/minute")
async def chat(chat_request: ChatRequest, request: Request):
    """
    Send a chat message and get a complete response
    """
    start_time = time.time()

    try:
        chat_manager = await get_chat_manager()
        response = await chat_manager.process_chat_request(chat_request)

        # Add timing information
        total_time = time.time() - start_time
        response.generation_time = getattr(response, 'generation_time', total_time)

        logger.info("chat_request_completed",
                   session_id=chat_request.session_id,
                   message_length=len(chat_request.message),
                   response_length=len(response.message),
                   total_time=total_time)

        return response

    except ModelNotLoadedError as e:
        logger.error("model_not_loaded", error=str(e), session_id=chat_request.session_id)
        raise HTTPException(status_code=503, detail="Model not available")

    except GenerationError as e:
        logger.error("generation_error", error=str(e), session_id=chat_request.session_id)
        raise HTTPException(status_code=500, detail="Failed to generate response")

    except Exception as e:
        logger.error("chat_request_failed", error=str(e), session_id=chat_request.session_id)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/chat/stream")
@limiter.limit(f"{settings.rate_limit}/minute")
async def chat_stream(
    request: Request,
    message: str = Query(..., description="Chat message"),
    session_id: str = Query(..., description="Session ID"),
    system_prompt: Optional[str] = Query(None, description="Custom system prompt"),
    temperature: Optional[float] = Query(None, ge=0.0, le=1.0, description="Temperature"),
    max_tokens: Optional[int] = Query(None, ge=1, le=2048, description="Max tokens")
):
    """
    Send a chat message and get a streaming response via Server-Sent Events
    """
    try:
        # Create chat request
        chat_request = ChatRequest(
            message=message,
            session_id=session_id,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True
        )

        chat_manager = await get_chat_manager()

        async def event_generator():
            try:
                async for chunk in chat_manager.process_streaming_chat_request(chat_request):
                    # Format as SSE event
                    chunk_data = {
                        "content": chunk.content,
                        "session_id": chunk.session_id,
                        "message_id": chunk.message_id,
                        "chunk_id": chunk.chunk_id,
                        "is_final": chunk.is_final,
                        "timestamp": chunk.timestamp.isoformat()
                    }

                    yield {
                        "event": "chunk",
                        "data": chunk_data
                    }

                    if chunk.is_final:
                        yield {
                            "event": "done",
                            "data": {"message": "Stream completed"}
                        }
                        break

            except Exception as e:
                logger.error("streaming_error", error=str(e), session_id=session_id)
                yield {
                    "event": "error",
                    "data": {"error": str(e)}
                }

        return EventSourceResponse(event_generator())

    except Exception as e:
        logger.error("stream_setup_failed", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail="Failed to setup stream")


@router.websocket("/chat/ws")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat
    """
    await manager.connect(websocket)
    session_id = None

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            # Extract request data
            message = data.get("message")
            session_id = data.get("session_id")
            system_prompt = data.get("system_prompt")
            temperature = data.get("temperature")
            max_tokens = data.get("max_tokens")

            if not message or not session_id:
                await websocket.send_json({
                    "error": "Message and session_id are required"
                })
                continue

            # Create chat request
            chat_request = ChatRequest(
                message=message,
                session_id=session_id,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )

            # Process streaming request
            chat_manager = await get_chat_manager()

            try:
                async for chunk in chat_manager.process_streaming_chat_request(chat_request):
                    await websocket.send_json({
                        "type": "chunk",
                        "content": chunk.content,
                        "session_id": chunk.session_id,
                        "message_id": chunk.message_id,
                        "chunk_id": chunk.chunk_id,
                        "is_final": chunk.is_final,
                        "timestamp": chunk.timestamp.isoformat()
                    })

                    if chunk.is_final:
                        break

            except Exception as e:
                logger.error("websocket_generation_error", error=str(e), session_id=session_id)
                await websocket.send_json({
                    "type": "error",
                    "error": str(e)
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("websocket_disconnected", session_id=session_id)
    except Exception as e:
        logger.error("websocket_error", error=str(e), session_id=session_id)
        manager.disconnect(websocket)


@router.get("/sessions/{session_id}", response_model=ConversationHistory)
async def get_session(session_id: str):
    """
    Get conversation history for a session
    """
    try:
        chat_manager = await get_chat_manager()
        history = await chat_manager.get_conversation_history(session_id)

        if not history:
            raise HTTPException(status_code=404, detail="Session not found")

        return history

    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_session_failed", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail="Failed to get session")


@router.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """
    Clear conversation history for a session
    """
    try:
        chat_manager = await get_chat_manager()
        success = await chat_manager.clear_conversation(session_id)

        if not success:
            raise HTTPException(status_code=404, detail="Session not found")

        return {"message": "Session cleared successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("clear_session_failed", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail="Failed to clear session")


@router.get("/sessions", response_model=List[Dict[str, Any]])
async def get_active_sessions():
    """
    Get list of active chat sessions
    """
    try:
        chat_manager = await get_chat_manager()
        sessions = await chat_manager.get_active_sessions()
        return sessions

    except Exception as e:
        logger.error("get_active_sessions_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get active sessions")


@router.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """
    Get information about the current model
    """
    try:
        model_manager = await get_model_manager()
        info = model_manager.get_model_info()

        return ModelInfo(
            name=info["name"],
            type=info["type"],
            loaded=info["loaded"],
            parameters=info.get("parameters"),
            capabilities=info.get("capabilities", [])
        )

    except Exception as e:
        logger.error("get_model_info_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get model info")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Comprehensive health check endpoint
    """
    try:
        chat_manager = await get_chat_manager()
        health_data = await chat_manager.health_check()

        # Extract key information
        overall_status = health_data.get("overall", {})
        model_info = health_data.get("model_manager", {})
        session_info = health_data.get("session_manager", {})

        return HealthResponse(
            status=overall_status.get("status", "unknown"),
            version=settings.app_version,
            model_type=settings.model_type,
            model_name=settings.model_name,
            model_loaded=model_info.get("status") == "healthy",
            uptime=time.time(),  # Simplified uptime
            active_sessions=session_info.get("active_sessions", 0),
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        logger.error("health_check_failed", error=str(e))
        return HealthResponse(
            status="unhealthy",
            version=settings.app_version,
            model_type=settings.model_type,
            model_name=settings.model_name,
            model_loaded=False,
            uptime=time.time(),
            active_sessions=0,
            timestamp=datetime.utcnow()
        )


@router.get("/status")
async def status():
    """
    Simple status endpoint
    """
    return {
        "status": "ok",
        "service": "sema-chat-api",
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/metrics")
async def metrics():
    """
    Prometheus metrics endpoint
    """
    if not settings.enable_metrics:
        raise HTTPException(status_code=404, detail="Metrics not enabled")

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
