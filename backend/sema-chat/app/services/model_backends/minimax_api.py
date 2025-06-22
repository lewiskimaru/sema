"""
MiniMax API backend
Uses MiniMax's API for their M1 model with reasoning capabilities
"""

import asyncio
import time
import uuid
import json
from typing import AsyncGenerator, List, Dict, Any, Optional
from datetime import datetime
import httpx

from .base import ModelBackend, ModelLoadError, GenerationError, ModelNotLoadedError
from ...models.schemas import ChatMessage, ChatResponse, StreamChunk
from ...core.config import settings


class MiniMaxAPIBackend(ModelBackend):
    """MiniMax API backend for M1 model"""
    
    def __init__(self, model_name: str, **kwargs):
        super().__init__(model_name, **kwargs)
        self.api_url = kwargs.get('api_url', settings.minimax_api_url)
        self.api_key = kwargs.get('api_key', settings.minimax_api_key)
        self.model_version = kwargs.get('model_version', settings.minimax_model_version)
        self.capabilities = ["chat", "streaming", "reasoning", "api_based"]
        
        # Generation parameters
        self.parameters = {
            'temperature': kwargs.get('temperature', settings.temperature),
            'max_tokens': kwargs.get('max_tokens', settings.max_new_tokens),
            'top_p': kwargs.get('top_p', settings.top_p),
        }
    
    async def load_model(self) -> bool:
        """Initialize the MiniMax API client"""
        try:
            if not self.api_key or not self.api_url:
                raise ModelLoadError("MiniMax API key and URL are required")
            
            self.log_info("Initializing MiniMax API client", model=self.model_name)
            
            # Test the connection
            await self._test_connection()
            
            self.is_loaded = True
            self.log_info("MiniMax API client initialized successfully", model=self.model_name)
            
            return True
            
        except Exception as e:
            self.log_error("Failed to initialize MiniMax API client", error=str(e), model=self.model_name)
            raise ModelLoadError(f"Failed to initialize MiniMax API for {self.model_name}: {str(e)}")
    
    async def unload_model(self) -> bool:
        """Clean up the API client"""
        try:
            self.is_loaded = False
            self.log_info("MiniMax API client cleaned up", model=self.model_name)
            return True
            
        except Exception as e:
            self.log_error("Failed to cleanup MiniMax API client", error=str(e), model=self.model_name)
            return False
    
    async def _test_connection(self):
        """Test the MiniMax API connection"""
        try:
            test_data = {
                'model': self.model_version,
                'messages': [{"role": "user", "content": "Hello"}],
                'stream': False,
                'max_tokens': 5,
                'temperature': 0.1
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {self.api_key}'
                    },
                    json=test_data,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    raise Exception(f"API test failed with status {response.status_code}")
            
            self.log_info("MiniMax API connection test successful", model=self.model_name)
            
        except Exception as e:
            self.log_error("MiniMax API connection test failed", error=str(e), model=self.model_name)
            raise
    
    def _format_messages_for_api(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Format messages for MiniMax API"""
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
        """Generate a complete response using MiniMax API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("MiniMax API client not initialized")
        
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
            
            # Prepare request data
            request_data = {
                'model': self.model_version,
                'messages': api_messages,
                'stream': False,
                'max_tokens': params['max_tokens'],
                'temperature': params['temperature'],
                'top_p': params.get('top_p', 0.9)
            }
            
            # Make API call
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {self.api_key}'
                    },
                    json=request_data,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    raise GenerationError(f"API request failed with status {response.status_code}")
                
                response_data = response.json()
            
            # Extract response text
            if 'choices' in response_data and response_data['choices']:
                choice = response_data['choices'][0]
                if 'message' in choice:
                    response_text = choice['message'].get('content', '')
                    reasoning_content = choice['message'].get('reasoning_content', '')
                    
                    # Combine reasoning and main content if both exist
                    if reasoning_content and response_text:
                        full_response = f"[Reasoning: {reasoning_content}]\n\n{response_text}"
                    else:
                        full_response = response_text or reasoning_content
                else:
                    full_response = str(response_data)
            else:
                full_response = str(response_data)
            
            generation_time = time.time() - start_time
            
            return ChatResponse(
                message=full_response.strip(),
                session_id=messages[-1].metadata.get('session_id', 'unknown') if messages[-1].metadata else 'unknown',
                message_id=message_id,
                model_name=self.model_name,
                generation_time=generation_time,
                token_count=len(full_response.split()),  # Approximate token count
                finish_reason="stop"
            )
            
        except Exception as e:
            self.log_error("MiniMax API generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate response via MiniMax API: {str(e)}")
    
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using MiniMax API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("MiniMax API client not initialized")
        
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
            
            # Prepare request data
            request_data = {
                'model': self.model_version,
                'messages': api_messages,
                'stream': True,
                'max_tokens': params['max_tokens'],
                'temperature': params['temperature'],
                'top_p': params.get('top_p', 0.9)
            }
            
            # Make streaming API call
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    'POST',
                    self.api_url,
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {self.api_key}'
                    },
                    json=request_data,
                    timeout=60.0
                ) as response:
                    
                    if response.status_code != 200:
                        raise GenerationError(f"Streaming request failed with status {response.status_code}")
                    
                    async for line in response.aiter_lines():
                        if line.startswith('data:'):
                            try:
                                data = json.loads(line[5:])  # Remove 'data:' prefix
                                
                                if 'choices' not in data:
                                    continue
                                
                                choice = data['choices'][0]
                                
                                # Handle delta content
                                if 'delta' in choice:
                                    delta = choice['delta']
                                    reasoning_content = delta.get('reasoning_content', '')
                                    content = delta.get('content', '')
                                    
                                    # Send reasoning content if available
                                    if reasoning_content:
                                        yield StreamChunk(
                                            content=f"[Thinking: {reasoning_content}]",
                                            session_id=session_id,
                                            message_id=message_id,
                                            chunk_id=chunk_id,
                                            is_final=False
                                        )
                                        chunk_id += 1
                                    
                                    # Send main content
                                    if content:
                                        yield StreamChunk(
                                            content=content,
                                            session_id=session_id,
                                            message_id=message_id,
                                            chunk_id=chunk_id,
                                            is_final=False
                                        )
                                        chunk_id += 1
                                
                                # Handle complete message
                                elif 'message' in choice:
                                    message_data = choice['message']
                                    reasoning_content = message_data.get('reasoning_content', '')
                                    main_content = message_data.get('content', '')
                                    
                                    if reasoning_content:
                                        yield StreamChunk(
                                            content=f"\n[Final reasoning: {reasoning_content}]\n",
                                            session_id=session_id,
                                            message_id=message_id,
                                            chunk_id=chunk_id,
                                            is_final=False
                                        )
                                        chunk_id += 1
                                    
                                    if main_content:
                                        yield StreamChunk(
                                            content=main_content,
                                            session_id=session_id,
                                            message_id=message_id,
                                            chunk_id=chunk_id,
                                            is_final=False
                                        )
                                        chunk_id += 1
                                
                            except json.JSONDecodeError:
                                continue
                            
                            # Add small delay
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
            self.log_error("MiniMax API streaming failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate streaming response via MiniMax API: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "name": self.model_name,
            "type": "minimax_api",
            "loaded": self.is_loaded,
            "provider": "MiniMax",
            "model_version": self.model_version,
            "capabilities": self.capabilities,
            "parameters": self.parameters,
            "requires_api_key": True,
            "api_key_configured": bool(self.api_key),
            "api_url": self.api_url
        }
