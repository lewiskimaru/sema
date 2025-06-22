"""
Chat Manager - Main orchestrator for chat functionality
Coordinates between model backends and session management
"""

import time
import uuid
from typing import AsyncGenerator, List, Optional, Dict, Any
from datetime import datetime

from ..core.config import settings
from ..core.logging import LoggerMixin
from ..models.schemas import (
    ChatMessage, ChatRequest, ChatResponse, StreamChunk, 
    ConversationHistory, ErrorResponse
)
from .model_manager import get_model_manager
from .session_manager import get_session_manager
from .model_backends.base import ModelBackendError, ModelNotLoadedError, GenerationError


class ChatManager(LoggerMixin):
    """
    Main chat service that orchestrates conversation handling
    """
    
    def __init__(self):
        self.is_initialized = False
        self.active_streams = 0
        self.max_concurrent_streams = settings.max_concurrent_streams
    
    async def initialize(self) -> bool:
        """Initialize the chat manager"""
        try:
            self.log_info("Initializing chat manager")
            
            # Initialize model manager
            model_manager = await get_model_manager()
            if not await model_manager.initialize():
                self.log_error("Failed to initialize model manager")
                return False
            
            # Initialize session manager
            session_manager = await get_session_manager()
            if not await session_manager.initialize():
                self.log_error("Failed to initialize session manager")
                return False
            
            self.is_initialized = True
            self.log_info("Chat manager initialized successfully")
            return True
            
        except Exception as e:
            self.log_error("Chat manager initialization failed", error=str(e))
            return False
    
    async def shutdown(self):
        """Shutdown the chat manager"""
        try:
            self.log_info("Shutting down chat manager")
            
            # Shutdown managers
            model_manager = await get_model_manager()
            await model_manager.shutdown()
            
            session_manager = await get_session_manager()
            await session_manager.shutdown()
            
            self.is_initialized = False
            self.log_info("Chat manager shutdown complete")
            
        except Exception as e:
            self.log_error("Chat manager shutdown failed", error=str(e))
    
    async def process_chat_request(self, request: ChatRequest) -> ChatResponse:
        """
        Process a non-streaming chat request
        
        Args:
            request: Chat request containing message and parameters
            
        Returns:
            ChatResponse: Complete response
        """
        if not self.is_initialized:
            raise RuntimeError("Chat manager not initialized")
        
        start_time = time.time()
        
        try:
            # Get managers
            model_manager = await get_model_manager()
            session_manager = await get_session_manager()
            
            if not model_manager.is_ready():
                raise ModelNotLoadedError("Model not ready for inference")
            
            # Ensure session exists
            await session_manager.create_session(request.session_id)
            
            # Add user message to session
            user_message = ChatMessage(
                role="user",
                content=request.message,
                timestamp=datetime.utcnow(),
                metadata={"session_id": request.session_id}
            )
            await session_manager.add_message(request.session_id, user_message)
            
            # Get conversation history
            messages = await self._prepare_messages_for_model(
                request.session_id, 
                request.system_prompt
            )
            
            # Generate response
            backend = model_manager.get_backend()
            response = await backend.generate_response(
                messages=messages,
                temperature=request.temperature or settings.temperature,
                max_tokens=request.max_tokens or settings.max_new_tokens
            )
            
            # Add assistant message to session
            assistant_message = ChatMessage(
                role="assistant",
                content=response.message,
                timestamp=datetime.utcnow(),
                metadata={"session_id": request.session_id, "message_id": response.message_id}
            )
            await session_manager.add_message(request.session_id, assistant_message)
            
            # Update response with correct session info
            response.session_id = request.session_id
            
            self.log_info("Chat request processed", 
                         session_id=request.session_id,
                         generation_time=response.generation_time,
                         total_time=time.time() - start_time)
            
            return response
            
        except ModelBackendError as e:
            self.log_error("Model backend error", error=str(e), session_id=request.session_id)
            raise
        except Exception as e:
            self.log_error("Chat request processing failed", error=str(e), session_id=request.session_id)
            raise
    
    async def process_streaming_chat_request(
        self, 
        request: ChatRequest
    ) -> AsyncGenerator[StreamChunk, None]:
        """
        Process a streaming chat request
        
        Args:
            request: Chat request containing message and parameters
            
        Yields:
            StreamChunk: Response chunks
        """
        if not self.is_initialized:
            raise RuntimeError("Chat manager not initialized")
        
        # Check concurrent stream limit
        if self.active_streams >= self.max_concurrent_streams:
            raise RuntimeError(f"Maximum concurrent streams ({self.max_concurrent_streams}) exceeded")
        
        self.active_streams += 1
        
        try:
            # Get managers
            model_manager = await get_model_manager()
            session_manager = await get_session_manager()
            
            if not model_manager.is_ready():
                raise ModelNotLoadedError("Model not ready for inference")
            
            # Ensure session exists
            await session_manager.create_session(request.session_id)
            
            # Add user message to session
            user_message = ChatMessage(
                role="user",
                content=request.message,
                timestamp=datetime.utcnow(),
                metadata={"session_id": request.session_id}
            )
            await session_manager.add_message(request.session_id, user_message)
            
            # Get conversation history
            messages = await self._prepare_messages_for_model(
                request.session_id, 
                request.system_prompt
            )
            
            # Generate streaming response
            backend = model_manager.get_backend()
            full_response = ""
            message_id = None
            
            async for chunk in backend.generate_stream(
                messages=messages,
                temperature=request.temperature or settings.temperature,
                max_tokens=request.max_tokens or settings.max_new_tokens
            ):
                if message_id is None:
                    message_id = chunk.message_id
                
                full_response += chunk.content
                yield chunk
            
            # Add complete assistant message to session
            if full_response.strip():
                assistant_message = ChatMessage(
                    role="assistant",
                    content=full_response.strip(),
                    timestamp=datetime.utcnow(),
                    metadata={"session_id": request.session_id, "message_id": message_id}
                )
                await session_manager.add_message(request.session_id, assistant_message)
            
            self.log_info("Streaming chat request processed", 
                         session_id=request.session_id,
                         response_length=len(full_response))
            
        except ModelBackendError as e:
            self.log_error("Model backend error in streaming", error=str(e), session_id=request.session_id)
            raise
        except Exception as e:
            self.log_error("Streaming chat request failed", error=str(e), session_id=request.session_id)
            raise
        finally:
            self.active_streams -= 1
    
    async def _prepare_messages_for_model(
        self, 
        session_id: str, 
        custom_system_prompt: Optional[str] = None
    ) -> List[ChatMessage]:
        """
        Prepare messages for model input, including system prompt and history
        
        Args:
            session_id: Session identifier
            custom_system_prompt: Optional custom system prompt
            
        Returns:
            List of ChatMessage objects ready for model input
        """
        session_manager = await get_session_manager()
        
        # Get conversation history
        history_messages = await session_manager.get_session_messages(session_id)
        
        # Prepare messages list
        messages = []
        
        # Add system prompt if provided
        system_prompt = custom_system_prompt or settings.get_system_prompt()
        if system_prompt:
            messages.append(ChatMessage(
                role="system",
                content=system_prompt,
                timestamp=datetime.utcnow()
            ))
        
        # Add conversation history
        messages.extend(history_messages)
        
        return messages
    
    async def get_conversation_history(self, session_id: str) -> Optional[ConversationHistory]:
        """
        Get conversation history for a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            ConversationHistory or None if session not found
        """
        try:
            session_manager = await get_session_manager()
            return await session_manager.get_session(session_id)
            
        except Exception as e:
            self.log_error("Failed to get conversation history", error=str(e), session_id=session_id)
            return None
    
    async def clear_conversation(self, session_id: str) -> bool:
        """
        Clear conversation history for a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            bool: True if cleared successfully
        """
        try:
            session_manager = await get_session_manager()
            return await session_manager.delete_session(session_id)
            
        except Exception as e:
            self.log_error("Failed to clear conversation", error=str(e), session_id=session_id)
            return False
    
    async def get_active_sessions(self) -> List[Dict[str, Any]]:
        """Get information about active chat sessions"""
        try:
            session_manager = await get_session_manager()
            sessions = await session_manager.get_active_sessions()
            
            return [
                {
                    "session_id": session.session_id,
                    "created_at": session.created_at.isoformat(),
                    "updated_at": session.updated_at.isoformat(),
                    "message_count": session.message_count,
                    "model_name": session.model_name,
                    "is_active": session.is_active
                }
                for session in sessions
            ]
            
        except Exception as e:
            self.log_error("Failed to get active sessions", error=str(e))
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform a comprehensive health check"""
        try:
            health_status = {
                "chat_manager": {
                    "status": "healthy" if self.is_initialized else "unhealthy",
                    "initialized": self.is_initialized,
                    "active_streams": self.active_streams,
                    "max_concurrent_streams": self.max_concurrent_streams
                }
            }
            
            # Check model manager
            model_manager = await get_model_manager()
            model_health = await model_manager.health_check()
            health_status["model_manager"] = model_health
            
            # Check session manager
            session_manager = await get_session_manager()
            active_sessions = await session_manager.get_active_sessions()
            health_status["session_manager"] = {
                "status": "healthy",
                "active_sessions": len(active_sessions),
                "storage_type": "redis" if session_manager.use_redis else "memory"
            }
            
            # Overall status
            overall_healthy = (
                self.is_initialized and
                model_health.get("status") == "healthy"
            )
            
            health_status["overall"] = {
                "status": "healthy" if overall_healthy else "unhealthy",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return health_status
            
        except Exception as e:
            self.log_error("Health check failed", error=str(e))
            return {
                "overall": {
                    "status": "unhealthy",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }


# Global chat manager instance
chat_manager = ChatManager()


async def get_chat_manager() -> ChatManager:
    """Get the global chat manager instance"""
    return chat_manager


async def initialize_chat_manager() -> bool:
    """Initialize the global chat manager"""
    return await chat_manager.initialize()


async def shutdown_chat_manager():
    """Shutdown the global chat manager"""
    await chat_manager.shutdown()
