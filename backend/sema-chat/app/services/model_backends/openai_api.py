"""
OpenAI API backend
Uses OpenAI's API for model access (GPT-3.5, GPT-4, etc.)
"""

import asyncio
import time
import uuid
from typing import AsyncGenerator, List, Dict, Any, Optional
from datetime import datetime
import openai

from .base import ModelBackend, ModelLoadError, GenerationError, ModelNotLoadedError
from ...models.schemas import ChatMessage, ChatResponse, StreamChunk
from ...core.config import settings


class OpenAIAPIBackend(ModelBackend):
    """OpenAI API backend"""
    
    def __init__(self, model_name: str, **kwargs):
        super().__init__(model_name, **kwargs)
        self.client = None
        self.api_key = kwargs.get('api_key', settings.openai_api_key)
        self.org_id = kwargs.get('org_id', settings.openai_org_id)
        self.capabilities = ["chat", "streaming", "api_based", "function_calling"]
        
        # Generation parameters
        self.parameters = {
            'temperature': kwargs.get('temperature', settings.temperature),
            'max_tokens': kwargs.get('max_tokens', settings.max_new_tokens),
            'top_p': kwargs.get('top_p', settings.top_p),
        }
    
    async def load_model(self) -> bool:
        """Initialize the OpenAI API client"""
        try:
            if not self.api_key:
                raise ModelLoadError("OpenAI API key is required")
            
            self.log_info("Initializing OpenAI API client", model=self.model_name)
            
            # Initialize the OpenAI client
            self.client = openai.AsyncOpenAI(
                api_key=self.api_key,
                organization=self.org_id
            )
            
            # Test the connection
            await self._test_connection()
            
            self.is_loaded = True
            self.log_info("OpenAI API client initialized successfully", model=self.model_name)
            
            return True
            
        except Exception as e:
            self.log_error("Failed to initialize OpenAI API client", error=str(e), model=self.model_name)
            raise ModelLoadError(f"Failed to initialize OpenAI API for {self.model_name}: {str(e)}")
    
    async def unload_model(self) -> bool:
        """Clean up the API client"""
        try:
            if self.client:
                await self.client.close()
            self.client = None
            self.is_loaded = False
            self.log_info("OpenAI API client cleaned up", model=self.model_name)
            return True
            
        except Exception as e:
            self.log_error("Failed to cleanup OpenAI API client", error=str(e), model=self.model_name)
            return False
    
    async def _test_connection(self):
        """Test the OpenAI API connection"""
        try:
            # Simple test request
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5,
                temperature=0.1
            )
            
            self.log_info("OpenAI API connection test successful", model=self.model_name)
            
        except Exception as e:
            self.log_error("OpenAI API connection test failed", error=str(e), model=self.model_name)
            raise
    
    def _format_messages_for_api(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Format messages for OpenAI API"""
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
        """Generate a complete response using OpenAI API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("OpenAI API client not initialized")
        
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
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=api_messages,
                max_tokens=params['max_tokens'],
                temperature=params['temperature'],
                top_p=params.get('top_p', 0.9),
                stream=False
            )
            
            # Extract response
            response_text = response.choices[0].message.content
            finish_reason = response.choices[0].finish_reason
            token_count = response.usage.completion_tokens if response.usage else None
            
            generation_time = time.time() - start_time
            
            return ChatResponse(
                message=response_text.strip(),
                session_id=messages[-1].metadata.get('session_id', 'unknown') if messages[-1].metadata else 'unknown',
                message_id=message_id,
                model_name=self.model_name,
                generation_time=generation_time,
                token_count=token_count,
                finish_reason=finish_reason
            )
            
        except Exception as e:
            self.log_error("OpenAI API generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate response via OpenAI API: {str(e)}")
    
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using OpenAI API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("OpenAI API client not initialized")
        
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
            
            # Create streaming request
            stream = await self.client.chat.completions.create(
                model=self.model_name,
                messages=api_messages,
                max_tokens=params['max_tokens'],
                temperature=params['temperature'],
                top_p=params.get('top_p', 0.9),
                stream=True
            )
            
            # Process streaming chunks
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    
                    yield StreamChunk(
                        content=content,
                        session_id=session_id,
                        message_id=message_id,
                        chunk_id=chunk_id,
                        is_final=False
                    )
                    chunk_id += 1
                    
                    # Add small delay to prevent overwhelming the client
                    await asyncio.sleep(settings.stream_delay)
                
                # Check if this is the final chunk
                if chunk.choices and chunk.choices[0].finish_reason:
                    break
            
            # Send final chunk
            yield StreamChunk(
                content="",
                session_id=session_id,
                message_id=message_id,
                chunk_id=chunk_id,
                is_final=True
            )
            
        except Exception as e:
            self.log_error("OpenAI API streaming failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate streaming response via OpenAI API: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "name": self.model_name,
            "type": "openai_api",
            "loaded": self.is_loaded,
            "provider": "OpenAI",
            "capabilities": self.capabilities,
            "parameters": self.parameters,
            "requires_api_key": True,
            "api_key_configured": bool(self.api_key),
            "organization": self.org_id
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the OpenAI API"""
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
                    timeout=10.0
                )
                
                response_time = time.time() - start_time
                
                return {
                    "status": "healthy",
                    "model_name": self.model_name,
                    "response_time": response_time,
                    "provider": "OpenAI"
                }
                
            except asyncio.TimeoutError:
                return {
                    "status": "unhealthy",
                    "reason": "api_timeout",
                    "model_name": self.model_name,
                    "provider": "OpenAI"
                }
                
        except Exception as e:
            self.log_error("OpenAI API health check failed", error=str(e), model=self.model_name)
            return {
                "status": "unhealthy",
                "reason": "api_error",
                "error": str(e),
                "model_name": self.model_name,
                "provider": "OpenAI"
            }
