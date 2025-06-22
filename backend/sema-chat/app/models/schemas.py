"""
Pydantic models for request/response validation
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime


class ChatMessage(BaseModel):
    """Individual chat message model"""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional message metadata")

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ['user', 'assistant', 'system']:
            raise ValueError('Role must be user, assistant, or system')
        return v


class ChatRequest(BaseModel):
    """Chat request model"""

    message: str = Field(
        ...,
        description="User message",
        min_length=1,
        max_length=4000,
        example="Hello, how are you today?"
    )
    session_id: str = Field(
        ...,
        description="Session identifier for conversation context",
        example="user-123-session"
    )
    system_prompt: Optional[str] = Field(
        default=None,
        description="Custom system prompt for this conversation",
        max_length=1000
    )
    temperature: Optional[float] = Field(
        default=None,
        description="Sampling temperature (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )
    max_tokens: Optional[int] = Field(
        default=None,
        description="Maximum tokens to generate",
        ge=1,
        le=2048
    )
    stream: Optional[bool] = Field(
        default=False,
        description="Whether to stream the response"
    )


class ChatResponse(BaseModel):
    """Chat response model"""

    message: str = Field(..., description="Assistant response message")
    session_id: str = Field(..., description="Session identifier")
    message_id: str = Field(..., description="Unique message identifier")
    model_name: str = Field(..., description="Model used for generation")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    generation_time: float = Field(..., description="Time taken to generate response (seconds)")
    token_count: Optional[int] = Field(default=None, description="Number of tokens in response")
    finish_reason: Optional[str] = Field(default=None, description="Reason generation finished")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Hello! I'm doing well, thank you for asking. How can I help you today?",
                "session_id": "user-123-session",
                "message_id": "msg-456-789",
                "model_name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                "timestamp": "2024-01-15T10:30:00Z",
                "generation_time": 1.234,
                "token_count": 25,
                "finish_reason": "stop"
            }
        }
    )


class StreamChunk(BaseModel):
    """Streaming response chunk model"""

    content: str = Field(..., description="Chunk content")
    session_id: str = Field(..., description="Session identifier")
    message_id: str = Field(..., description="Message identifier")
    chunk_id: int = Field(..., description="Chunk sequence number")
    is_final: bool = Field(default=False, description="Whether this is the final chunk")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Chunk timestamp")


class ConversationHistory(BaseModel):
    """Conversation history model"""

    session_id: str = Field(..., description="Session identifier")
    messages: List[ChatMessage] = Field(..., description="List of messages in conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Session creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")
    message_count: int = Field(..., description="Total number of messages")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "session_id": "user-123-session",
                "messages": [
                    {
                        "role": "user",
                        "content": "Hello!",
                        "timestamp": "2024-01-15T10:30:00Z"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I help you today?",
                        "timestamp": "2024-01-15T10:30:01Z"
                    }
                ],
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:01Z",
                "message_count": 2
            }
        }
    )


class SessionInfo(BaseModel):
    """Session information model"""

    session_id: str = Field(..., description="Session identifier")
    created_at: datetime = Field(..., description="Session creation time")
    updated_at: datetime = Field(..., description="Last activity time")
    message_count: int = Field(..., description="Number of messages in session")
    model_name: str = Field(..., description="Model used in this session")
    is_active: bool = Field(..., description="Whether session is active")


class HealthResponse(BaseModel):
    """Health check response model"""

    status: str = Field(..., description="API health status")
    version: str = Field(..., description="API version")
    model_type: str = Field(..., description="Current model backend type")
    model_name: str = Field(..., description="Current model name")
    model_loaded: bool = Field(..., description="Whether model is loaded and ready")
    uptime: float = Field(..., description="API uptime in seconds")
    active_sessions: int = Field(..., description="Number of active chat sessions")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "model_type": "local",
                "model_name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                "model_loaded": True,
                "uptime": 3600.5,
                "active_sessions": 5,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }
    )


class ErrorResponse(BaseModel):
    """Error response model"""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Additional error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
    request_id: Optional[str] = Field(default=None, description="Request identifier for debugging")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "error": "validation_error",
                "message": "Message content is required",
                "details": {"field": "message", "constraint": "min_length"},
                "timestamp": "2024-01-15T10:30:00Z",
                "request_id": "req-123-456"
            }
        }
    )


class ModelInfo(BaseModel):
    """Model information model"""

    name: str = Field(..., description="Model name")
    type: str = Field(..., description="Model backend type")
    loaded: bool = Field(..., description="Whether model is loaded")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Model parameters")
    capabilities: List[str] = Field(default=[], description="Model capabilities")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                "type": "local",
                "loaded": True,
                "parameters": {
                    "temperature": 0.7,
                    "max_tokens": 512,
                    "top_p": 0.9
                },
                "capabilities": ["chat", "instruction_following", "streaming"]
            }
        }
    )
