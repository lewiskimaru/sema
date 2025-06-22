"""
Abstract base class for model backends
Defines the interface that all model backends must implement
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Any, Optional
from ...models.schemas import ChatMessage, ChatResponse, StreamChunk
from ...core.logging import LoggerMixin


class ModelBackend(ABC, LoggerMixin):
    """Abstract base class for all model backends"""
    
    def __init__(self, model_name: str, **kwargs):
        self.model_name = model_name
        self.is_loaded = False
        self.capabilities = []
        self.parameters = {}
    
    @abstractmethod
    async def load_model(self) -> bool:
        """
        Load the model and prepare it for inference
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        pass
    
    @abstractmethod
    async def unload_model(self) -> bool:
        """
        Unload the model and free resources
        
        Returns:
            bool: True if model unloaded successfully, False otherwise
        """
        pass
    
    @abstractmethod
    async def generate_response(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> ChatResponse:
        """
        Generate a complete response (non-streaming)
        
        Args:
            messages: List of conversation messages
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional generation parameters
            
        Returns:
            ChatResponse: Complete response
        """
        pass
    
    @abstractmethod
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """
        Generate a streaming response
        
        Args:
            messages: List of conversation messages
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional generation parameters
            
        Yields:
            StreamChunk: Response chunks
        """
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model
        
        Returns:
            Dict containing model information
        """
        pass
    
    def supports_streaming(self) -> bool:
        """Check if this backend supports streaming"""
        return "streaming" in self.capabilities
    
    def supports_chat(self) -> bool:
        """Check if this backend supports chat/conversation"""
        return "chat" in self.capabilities
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded and ready"""
        return self.is_loaded
    
    def format_messages_for_model(self, messages: List[ChatMessage]) -> Any:
        """
        Format messages for the specific model format
        Override in subclasses if needed
        
        Args:
            messages: List of ChatMessage objects
            
        Returns:
            Formatted messages for the model
        """
        return [{"role": msg.role, "content": msg.content} for msg in messages]
    
    def validate_parameters(self, **kwargs) -> Dict[str, Any]:
        """
        Validate and normalize generation parameters
        
        Args:
            **kwargs: Generation parameters
            
        Returns:
            Dict of validated parameters
        """
        validated = {}
        
        # Temperature validation
        temperature = kwargs.get('temperature', 0.7)
        validated['temperature'] = max(0.0, min(1.0, float(temperature)))
        
        # Max tokens validation
        max_tokens = kwargs.get('max_tokens', 512)
        validated['max_tokens'] = max(1, min(2048, int(max_tokens)))
        
        # Top-p validation
        top_p = kwargs.get('top_p', 0.9)
        validated['top_p'] = max(0.0, min(1.0, float(top_p)))
        
        # Top-k validation
        top_k = kwargs.get('top_k', 50)
        validated['top_k'] = max(1, int(top_k))
        
        return validated
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the model backend
        
        Returns:
            Dict containing health status
        """
        try:
            if not self.is_loaded:
                return {
                    "status": "unhealthy",
                    "reason": "model_not_loaded",
                    "model_name": self.model_name
                }
            
            # Try a simple generation to test the model
            test_messages = [
                ChatMessage(role="user", content="Hello")
            ]
            
            # Use a timeout for the health check
            import asyncio
            try:
                response = await asyncio.wait_for(
                    self.generate_response(
                        test_messages,
                        temperature=0.1,
                        max_tokens=10
                    ),
                    timeout=10.0
                )
                
                return {
                    "status": "healthy",
                    "model_name": self.model_name,
                    "response_time": getattr(response, 'generation_time', 0.0)
                }
                
            except asyncio.TimeoutError:
                return {
                    "status": "unhealthy",
                    "reason": "timeout",
                    "model_name": self.model_name
                }
                
        except Exception as e:
            self.log_error("Health check failed", error=str(e), model=self.model_name)
            return {
                "status": "unhealthy",
                "reason": "generation_error",
                "error": str(e),
                "model_name": self.model_name
            }


class ModelBackendError(Exception):
    """Base exception for model backend errors"""
    pass


class ModelLoadError(ModelBackendError):
    """Exception raised when model loading fails"""
    pass


class GenerationError(ModelBackendError):
    """Exception raised when text generation fails"""
    pass


class ModelNotLoadedError(ModelBackendError):
    """Exception raised when trying to use an unloaded model"""
    pass
