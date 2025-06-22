"""
Google AI Studio API backend
Uses Google's AI Studio API for Gemma and other Google models
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


class GoogleAIBackend(ModelBackend):
    """Google AI Studio API backend for Gemma and other Google models"""
    
    def __init__(self, model_name: str, **kwargs):
        super().__init__(model_name, **kwargs)
        self.api_key = kwargs.get('api_key', settings.google_api_key)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.capabilities = ["chat", "streaming", "api_based"]
        
        # Generation parameters
        self.parameters = {
            'temperature': kwargs.get('temperature', settings.temperature),
            'max_tokens': kwargs.get('max_tokens', settings.max_new_tokens),
            'top_p': kwargs.get('top_p', settings.top_p),
            'top_k': kwargs.get('top_k', settings.top_k),
        }
    
    async def load_model(self) -> bool:
        """Initialize the Google AI API client"""
        try:
            if not self.api_key:
                raise ModelLoadError("Google AI API key is required")
            
            self.log_info("Initializing Google AI API client", model=self.model_name)
            
            # Test the connection
            await self._test_connection()
            
            self.is_loaded = True
            self.log_info("Google AI API client initialized successfully", model=self.model_name)
            
            return True
            
        except Exception as e:
            self.log_error("Failed to initialize Google AI API client", error=str(e), model=self.model_name)
            raise ModelLoadError(f"Failed to initialize Google AI API for {self.model_name}: {str(e)}")
    
    async def unload_model(self) -> bool:
        """Clean up the API client"""
        try:
            self.is_loaded = False
            self.log_info("Google AI API client cleaned up", model=self.model_name)
            return True
            
        except Exception as e:
            self.log_error("Failed to cleanup Google AI API client", error=str(e), model=self.model_name)
            return False
    
    async def _test_connection(self):
        """Test the Google AI API connection"""
        try:
            url = f"{self.base_url}/models/{self.model_name}:generateContent"
            
            test_data = {
                "contents": [
                    {
                        "parts": [{"text": "Hello"}]
                    }
                ],
                "generationConfig": {
                    "maxOutputTokens": 5,
                    "temperature": 0.1
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{url}?key={self.api_key}",
                    headers={'Content-Type': 'application/json'},
                    json=test_data,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    raise Exception(f"API test failed with status {response.status_code}: {response.text}")
            
            self.log_info("Google AI API connection test successful", model=self.model_name)
            
        except Exception as e:
            self.log_error("Google AI API connection test failed", error=str(e), model=self.model_name)
            raise
    
    def _format_messages_for_api(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """Format messages for Google AI API"""
        contents = []
        system_instruction = None
        
        for msg in messages:
            if msg.role == "system":
                system_instruction = msg.content
            elif msg.role == "user":
                contents.append({
                    "role": "user",
                    "parts": [{"text": msg.content}]
                })
            elif msg.role == "assistant":
                contents.append({
                    "role": "model",
                    "parts": [{"text": msg.content}]
                })
        
        result = {"contents": contents}
        if system_instruction:
            result["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        
        return result
    
    async def generate_response(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> ChatResponse:
        """Generate a complete response using Google AI API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("Google AI API client not initialized")
        
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
            api_data = self._format_messages_for_api(messages)
            
            # Add generation config
            api_data["generationConfig"] = {
                "maxOutputTokens": params['max_tokens'],
                "temperature": params['temperature'],
                "topP": params.get('top_p', 0.9),
                "topK": params.get('top_k', 40)
            }
            
            # Make API call
            url = f"{self.base_url}/models/{self.model_name}:generateContent"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{url}?key={self.api_key}",
                    headers={'Content-Type': 'application/json'},
                    json=api_data,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    raise GenerationError(f"API request failed with status {response.status_code}: {response.text}")
                
                response_data = response.json()
            
            # Extract response text
            if 'candidates' in response_data and response_data['candidates']:
                candidate = response_data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    parts = candidate['content']['parts']
                    response_text = ''.join(part.get('text', '') for part in parts)
                else:
                    response_text = str(response_data)
            else:
                response_text = str(response_data)
            
            generation_time = time.time() - start_time
            
            return ChatResponse(
                message=response_text.strip(),
                session_id=messages[-1].metadata.get('session_id', 'unknown') if messages[-1].metadata else 'unknown',
                message_id=message_id,
                model_name=self.model_name,
                generation_time=generation_time,
                token_count=len(response_text.split()),  # Approximate token count
                finish_reason="stop"
            )
            
        except Exception as e:
            self.log_error("Google AI API generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate response via Google AI API: {str(e)}")
    
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using Google AI API"""
        if not self.is_loaded:
            raise ModelNotLoadedError("Google AI API client not initialized")
        
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
            api_data = self._format_messages_for_api(messages)
            
            # Add generation config
            api_data["generationConfig"] = {
                "maxOutputTokens": params['max_tokens'],
                "temperature": params['temperature'],
                "topP": params.get('top_p', 0.9),
                "topK": params.get('top_k', 40)
            }
            
            # Make streaming API call
            url = f"{self.base_url}/models/{self.model_name}:streamGenerateContent"
            
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    'POST',
                    f"{url}?key={self.api_key}",
                    headers={'Content-Type': 'application/json'},
                    json=api_data,
                    timeout=60.0
                ) as response:
                    
                    if response.status_code != 200:
                        raise GenerationError(f"Streaming request failed with status {response.status_code}")
                    
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                # Google AI API returns JSON objects separated by newlines
                                data = json.loads(line)
                                
                                if 'candidates' in data and data['candidates']:
                                    candidate = data['candidates'][0]
                                    if 'content' in candidate and 'parts' in candidate['content']:
                                        parts = candidate['content']['parts']
                                        content = ''.join(part.get('text', '') for part in parts)
                                        
                                        if content:
                                            yield StreamChunk(
                                                content=content,
                                                session_id=session_id,
                                                message_id=message_id,
                                                chunk_id=chunk_id,
                                                is_final=False
                                            )
                                            chunk_id += 1
                                            
                                            # Add small delay
                                            await asyncio.sleep(settings.stream_delay)
                                
                            except json.JSONDecodeError:
                                continue
            
            # Send final chunk
            yield StreamChunk(
                content="",
                session_id=session_id,
                message_id=message_id,
                chunk_id=chunk_id,
                is_final=True
            )
            
        except Exception as e:
            self.log_error("Google AI API streaming failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate streaming response via Google AI API: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "name": self.model_name,
            "type": "google_ai",
            "loaded": self.is_loaded,
            "provider": "Google AI Studio",
            "capabilities": self.capabilities,
            "parameters": self.parameters,
            "requires_api_key": True,
            "api_key_configured": bool(self.api_key),
            "base_url": self.base_url
        }
