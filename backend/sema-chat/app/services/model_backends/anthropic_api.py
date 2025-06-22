"""
Anthropic API backend
Uses Anthropic's API for Claude models
"""

import asyncio
import time
import uuid
from typing import AsyncGenerator, List, Dict, Any, Optional
from datetime import datetime
import anthropic

from .base import ModelBackend, ModelLoadError, GenerationError, ModelNotLoadedError
from ...models.schemas import ChatMessage, ChatResponse, StreamChunk
from ...core.config import settings


class AnthropicAPIBackend(ModelBackend):
    """Anthropic API backend for Claude models"""
    
    def __init__(self, model_name: str, **kwargs):
        super().__init__(model_name, **kwargs)
        self.client = None
        self.api_key = kwargs.get('api_key', settings.anthropic_api_key)
        self.capabilities = ["chat", "streaming", "api_based", "long_context"]
        
        # Generation parameters
        self.parameters = {
            'temperature': kwargs.get('temperature', settings.temperature),
            'max_tokens': kwargs.get('max_tokens', settings.max_new_tokens),
            'top_p': kwargs.get('top_p', settings.top_p),
        }
    
    async def load_model(self) -> bool:
        """Initialize the Anthropic API client"""
        try:
            if not self.api_key:
                raise ModelLoadError("Anthropic API key is required")
            
            self.log_info("Initializing Anthropic API client", model=self.model_name)
            
            # Initialize the Anthropic client
            self.client = anthropic.AsyncAnthropic(
                api_key=self.api_key
            )
            
            # Test the connection
            await self._test_connection()
            
            self.is_loaded = True
            self.log_info("Anthropic API client initialized successfully", model=self.model_name)
            
            return True
            
        except Exception as e:
            self.log_error("Failed to initialize Anthropic API client", error=str(e), model=self.model_name)
            raise ModelLoadError(f"Failed to initialize Anthropic API for {self.model_name}: {str(e)}")
    
    async def unload_model(self) -> bool:
        """Clean up the API client"""
        try:
            if self.client:
                await self.client.close()
            self.client = None
            self.is_loaded = False
            self.log_info("Anthropic API client cleaned up", model=self.model_name)
            return True
            
        except Exception as e:
            self.log_error("Failed to cleanup Anthropic API client", error=str(e), model=self.model_name)
            return False
    
    async def _test_connection(self):
        """Test the Anthropic API connection"""
        try:
            # Simple test request
            response = await self.client.messages.create(
                model=self.model_name,
                max_tokens=5,
                temperature=0.1,
                messages=[{"role": "user", "content": "Hello"}]
            )
            
            self.log_info("Anthropic API connection test successful", model=self.model_name)
            
        except Exception as e:
            self.log_error("Anthropic API connection test failed", error=str(e), model=self.model_name)
            raise
    
    def _format_messages_for_api(self, messages: List[ChatMessage]) -> tuple:
        """Format messages for Anthropic API (separate system and messages)"""
        system_message = None
        formatted_messages = []
        
        for msg in messages:
            if msg.role == "system":
                system_message = msg.content
            else:
                formatted_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        return system_message, formatted_messages
    
    async def generate_response(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> ChatResponse:
        """Generate a complete response using Anthropic API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("Anthropic API client not initialized")
        
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
            system_message, api_messages = self._format_messages_for_api(messages)
            
            # Prepare request parameters
            request_params = {
                "model": self.model_name,
                "messages": api_messages,
                "max_tokens": params['max_tokens'],
                "temperature": params['temperature'],
                "top_p": params.get('top_p', 0.9),
                "stream": False
            }
            
            # Add system message if present
            if system_message:
                request_params["system"] = system_message
            
            # Make API call
            response = await self.client.messages.create(**request_params)
            
            # Extract response
            response_text = response.content[0].text if response.content else ""
            finish_reason = getattr(response, 'stop_reason', 'stop')
            token_count = getattr(response.usage, 'output_tokens', None) if hasattr(response, 'usage') else None
            
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
            self.log_error("Anthropic API generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate response via Anthropic API: {str(e)}")
    
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using Anthropic API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("Anthropic API client not initialized")
        
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
            system_message, api_messages = self._format_messages_for_api(messages)
            
            # Prepare request parameters
            request_params = {
                "model": self.model_name,
                "messages": api_messages,
                "max_tokens": params['max_tokens'],
                "temperature": params['temperature'],
                "top_p": params.get('top_p', 0.9),
                "stream": True
            }
            
            # Add system message if present
            if system_message:
                request_params["system"] = system_message
            
            # Create streaming request
            stream = await self.client.messages.create(**request_params)
            
            # Process streaming chunks
            async for chunk in stream:
                if chunk.type == "content_block_delta":
                    if hasattr(chunk.delta, 'text') and chunk.delta.text:
                        yield StreamChunk(
                            content=chunk.delta.text,
                            session_id=session_id,
                            message_id=message_id,
                            chunk_id=chunk_id,
                            is_final=False
                        )
                        chunk_id += 1
                        
                        # Add small delay to prevent overwhelming the client
                        await asyncio.sleep(settings.stream_delay)
                
                elif chunk.type == "message_stop":
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
            self.log_error("Anthropic API streaming failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate streaming response via Anthropic API: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "name": self.model_name,
            "type": "anthropic_api",
            "loaded": self.is_loaded,
            "provider": "Anthropic",
            "capabilities": self.capabilities,
            "parameters": self.parameters,
            "requires_api_key": True,
            "api_key_configured": bool(self.api_key),
            "context_window": self._get_context_window()
        }
    
    def _get_context_window(self) -> int:
        """Get the context window size for the model"""
        context_windows = {
            "claude-3-haiku-20240307": 200000,
            "claude-3-sonnet-20240229": 200000,
            "claude-3-opus-20240229": 200000,
            "claude-3-5-sonnet-20241022": 200000,
            "claude-3-5-haiku-20241022": 200000,
        }
        return context_windows.get(self.model_name, 100000)
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the Anthropic API"""
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
                    "provider": "Anthropic",
                    "context_window": self._get_context_window()
                }
                
            except asyncio.TimeoutError:
                return {
                    "status": "unhealthy",
                    "reason": "api_timeout",
                    "model_name": self.model_name,
                    "provider": "Anthropic"
                }
                
        except Exception as e:
            self.log_error("Anthropic API health check failed", error=str(e), model=self.model_name)
            return {
                "status": "unhealthy",
                "reason": "api_error",
                "error": str(e),
                "model_name": self.model_name,
                "provider": "Anthropic"
            }
