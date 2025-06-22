"""
HuggingFace Inference API backend
Uses HuggingFace's hosted inference API for model access
"""

import asyncio
import time
import uuid
import json
from typing import AsyncGenerator, List, Dict, Any, Optional
from datetime import datetime
import httpx
from huggingface_hub import InferenceClient

from .base import ModelBackend, ModelLoadError, GenerationError, ModelNotLoadedError
from ...models.schemas import ChatMessage, ChatResponse, StreamChunk
from ...core.config import settings


class HuggingFaceAPIBackend(ModelBackend):
    """HuggingFace Inference API backend"""
    
    def __init__(self, model_name: str, **kwargs):
        super().__init__(model_name, **kwargs)
        self.client = None
        self.api_token = kwargs.get('api_token', settings.hf_api_token)
        self.inference_url = kwargs.get('inference_url', settings.hf_inference_url)
        self.capabilities = ["chat", "streaming", "api_based"]
        
        # Generation parameters
        self.parameters = {
            'temperature': kwargs.get('temperature', settings.temperature),
            'max_tokens': kwargs.get('max_tokens', settings.max_new_tokens),
            'top_p': kwargs.get('top_p', settings.top_p),
        }
    
    async def load_model(self) -> bool:
        """Initialize the HuggingFace API client"""
        try:
            if not self.api_token:
                raise ModelLoadError("HuggingFace API token is required")
            
            self.log_info("Initializing HuggingFace API client", model=self.model_name)
            
            # Initialize the inference client
            self.client = InferenceClient(
                model=self.model_name,
                token=self.api_token
            )
            
            # Test the connection with a simple request
            await self._test_connection()
            
            self.is_loaded = True
            self.log_info("HuggingFace API client initialized successfully", model=self.model_name)
            
            return True
            
        except Exception as e:
            self.log_error("Failed to initialize HuggingFace API client", error=str(e), model=self.model_name)
            raise ModelLoadError(f"Failed to initialize HuggingFace API for {self.model_name}: {str(e)}")
    
    async def unload_model(self) -> bool:
        """Clean up the API client"""
        try:
            self.client = None
            self.is_loaded = False
            self.log_info("HuggingFace API client cleaned up", model=self.model_name)
            return True
            
        except Exception as e:
            self.log_error("Failed to cleanup API client", error=str(e), model=self.model_name)
            return False
    
    async def _test_connection(self):
        """Test the API connection"""
        try:
            # Simple test message
            test_messages = [{"role": "user", "content": "Hello"}]
            
            # Use asyncio to run the sync client method
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat_completion(
                    messages=test_messages,
                    max_tokens=10,
                    temperature=0.1
                )
            )
            
            self.log_info("API connection test successful", model=self.model_name)
            
        except Exception as e:
            self.log_error("API connection test failed", error=str(e), model=self.model_name)
            raise
    
    def _format_messages_for_api(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Format messages for HuggingFace API"""
        formatted = []
        for msg in messages:
            formatted.append({
                "role": msg.role,
                "content": msg.content
            })
        return formatted
    
    async def generate_response(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> ChatResponse:
        """Generate a complete response using HuggingFace API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("HuggingFace API client not initialized")
        
        start_time = time.time()
        message_id = str(uuid.uuid4())
        
        try:
            # Validate parameters
            params = self.validate_parameters(
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            # Format messages
            api_messages = self._format_messages_for_api(messages)
            
            # Make API call
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat_completion(
                    messages=api_messages,
                    max_tokens=params['max_tokens'],
                    temperature=params['temperature'],
                    top_p=params.get('top_p', 0.9),
                    stream=False
                )
            )
            
            # Extract response text
            if hasattr(response, 'choices') and response.choices:
                response_text = response.choices[0].message.content
                finish_reason = getattr(response.choices[0], 'finish_reason', 'stop')
            else:
                response_text = str(response)
                finish_reason = 'unknown'
            
            generation_time = time.time() - start_time
            
            return ChatResponse(
                message=response_text.strip(),
                session_id=messages[-1].metadata.get('session_id', 'unknown') if messages[-1].metadata else 'unknown',
                message_id=message_id,
                model_name=self.model_name,
                generation_time=generation_time,
                token_count=len(response_text.split()),  # Approximate token count
                finish_reason=finish_reason
            )
            
        except Exception as e:
            self.log_error("HuggingFace API generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate response via HuggingFace API: {str(e)}")
    
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using HuggingFace API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("HuggingFace API client not initialized")
        
        message_id = str(uuid.uuid4())
        session_id = messages[-1].metadata.get('session_id', 'unknown') if messages[-1].metadata else 'unknown'
        chunk_id = 0
        
        try:
            # Validate parameters
            params = self.validate_parameters(
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            # Format messages
            api_messages = self._format_messages_for_api(messages)
            
            # Create streaming generator
            loop = asyncio.get_event_loop()
            
            def stream_generator():
                return self.client.chat_completion(
                    messages=api_messages,
                    max_tokens=params['max_tokens'],
                    temperature=params['temperature'],
                    top_p=params.get('top_p', 0.9),
                    stream=True
                )
            
            # Get the streaming response
            stream = await loop.run_in_executor(None, stream_generator)
            
            # Process streaming chunks
            for chunk in stream:
                if hasattr(chunk, 'choices') and chunk.choices:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, 'content') and delta.content:
                        yield StreamChunk(
                            content=delta.content,
                            session_id=session_id,
                            message_id=message_id,
                            chunk_id=chunk_id,
                            is_final=False
                        )
                        chunk_id += 1
                        
                        # Add small delay to prevent overwhelming the client
                        await asyncio.sleep(settings.stream_delay)
            
            # Send final chunk
            yield StreamChunk(
                content="",
                session_id=session_id,
                message_id=message_id,
                chunk_id=chunk_id,
                is_final=True
            )
            
        except Exception as e:
            self.log_error("HuggingFace API streaming failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate streaming response via HuggingFace API: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "name": self.model_name,
            "type": "huggingface_api",
            "loaded": self.is_loaded,
            "api_endpoint": self.inference_url,
            "capabilities": self.capabilities,
            "parameters": self.parameters,
            "requires_token": True,
            "token_configured": bool(self.api_token)
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the HuggingFace API"""
        try:
            if not self.is_loaded:
                return {
                    "status": "unhealthy",
                    "reason": "client_not_initialized",
                    "model_name": self.model_name
                }
            
            # Test API connectivity
            start_time = time.time()
            test_messages = [ChatMessage(role="user", content="Hi")]
            
            try:
                response = await asyncio.wait_for(
                    self.generate_response(
                        test_messages,
                        temperature=0.1,
                        max_tokens=5
                    ),
                    timeout=15.0
                )
                
                response_time = time.time() - start_time
                
                return {
                    "status": "healthy",
                    "model_name": self.model_name,
                    "response_time": response_time,
                    "api_endpoint": self.inference_url
                }
                
            except asyncio.TimeoutError:
                return {
                    "status": "unhealthy",
                    "reason": "api_timeout",
                    "model_name": self.model_name,
                    "api_endpoint": self.inference_url
                }
                
        except Exception as e:
            self.log_error("HuggingFace API health check failed", error=str(e), model=self.model_name)
            return {
                "status": "unhealthy",
                "reason": "api_error",
                "error": str(e),
                "model_name": self.model_name,
                "api_endpoint": self.inference_url
            }
