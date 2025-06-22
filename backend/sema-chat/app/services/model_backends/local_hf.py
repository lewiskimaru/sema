"""
Local HuggingFace model backend
Loads and runs models locally using transformers library
"""

import asyncio
import time
import uuid
from typing import AsyncGenerator, List, Dict, Any, Optional
from datetime import datetime
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TextIteratorStreamer,
    GenerationConfig
)
from threading import Thread
from queue import Queue

from .base import ModelBackend, ModelLoadError, GenerationError, ModelNotLoadedError
from ...models.schemas import ChatMessage, ChatResponse, StreamChunk
from ...core.config import settings


class LocalHuggingFaceBackend(ModelBackend):
    """Local HuggingFace model backend using transformers"""
    
    def __init__(self, model_name: str, **kwargs):
        super().__init__(model_name, **kwargs)
        self.tokenizer = None
        self.model = None
        self.device = kwargs.get('device', settings.device)
        self.capabilities = ["chat", "streaming", "instruction_following"]
        
        # Generation parameters
        self.parameters = {
            'temperature': kwargs.get('temperature', settings.temperature),
            'max_tokens': kwargs.get('max_tokens', settings.max_new_tokens),
            'top_p': kwargs.get('top_p', settings.top_p),
            'top_k': kwargs.get('top_k', settings.top_k),
        }
    
    async def load_model(self) -> bool:
        """Load the HuggingFace model and tokenizer"""
        try:
            self.log_info("Loading local HuggingFace model", model=self.model_name)
            
            # Determine device
            if self.device == "auto":
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
            
            self.log_info("Using device", device=self.device)
            
            # Load tokenizer
            self.log_info("Loading tokenizer")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                padding_side="left"
            )
            
            # Add pad token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model
            self.log_info("Loading model")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                low_cpu_mem_usage=True
            )
            
            if self.device == "cpu":
                self.model = self.model.to(self.device)
            
            # Set model to evaluation mode
            self.model.eval()
            
            self.is_loaded = True
            self.log_info("Model loaded successfully", 
                         model=self.model_name, 
                         device=self.device,
                         parameters=self.model.num_parameters() if hasattr(self.model, 'num_parameters') else 'unknown')
            
            return True
            
        except Exception as e:
            self.log_error("Failed to load model", error=str(e), model=self.model_name)
            raise ModelLoadError(f"Failed to load model {self.model_name}: {str(e)}")
    
    async def unload_model(self) -> bool:
        """Unload the model and free memory"""
        try:
            if self.model is not None:
                del self.model
                self.model = None
            
            if self.tokenizer is not None:
                del self.tokenizer
                self.tokenizer = None
            
            # Clear CUDA cache if using GPU
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            self.is_loaded = False
            self.log_info("Model unloaded successfully", model=self.model_name)
            return True
            
        except Exception as e:
            self.log_error("Failed to unload model", error=str(e), model=self.model_name)
            return False
    
    def _prepare_chat_input(self, messages: List[ChatMessage]) -> str:
        """Prepare chat messages for the model"""
        if not self.tokenizer:
            raise ModelNotLoadedError("Tokenizer not loaded")
        
        # Check if tokenizer has chat template
        if hasattr(self.tokenizer, 'apply_chat_template') and self.tokenizer.chat_template:
            # Use the model's chat template
            formatted_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
            return self.tokenizer.apply_chat_template(
                formatted_messages, 
                tokenize=False, 
                add_generation_prompt=True
            )
        else:
            # Fallback to simple concatenation
            chat_text = ""
            for msg in messages:
                if msg.role == "system":
                    chat_text += f"System: {msg.content}\n"
                elif msg.role == "user":
                    chat_text += f"User: {msg.content}\n"
                elif msg.role == "assistant":
                    chat_text += f"Assistant: {msg.content}\n"
            
            chat_text += "Assistant: "
            return chat_text
    
    async def generate_response(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> ChatResponse:
        """Generate a complete response"""
        if not self.is_loaded:
            raise ModelNotLoadedError("Model not loaded")
        
        start_time = time.time()
        message_id = str(uuid.uuid4())
        
        try:
            # Validate parameters
            params = self.validate_parameters(
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            # Prepare input
            chat_input = self._prepare_chat_input(messages)
            
            # Tokenize input
            inputs = self.tokenizer(
                chat_input,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=settings.max_length - params['max_tokens']
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=params['max_tokens'],
                    temperature=params['temperature'],
                    top_p=params['top_p'],
                    top_k=params['top_k'],
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.1,
                    no_repeat_ngram_size=3
                )
            
            # Decode response
            input_length = inputs['input_ids'].shape[1]
            generated_tokens = outputs[0][input_length:]
            response_text = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
            
            generation_time = time.time() - start_time
            
            return ChatResponse(
                message=response_text.strip(),
                session_id=messages[-1].metadata.get('session_id', 'unknown') if messages[-1].metadata else 'unknown',
                message_id=message_id,
                model_name=self.model_name,
                generation_time=generation_time,
                token_count=len(generated_tokens),
                finish_reason="stop"
            )
            
        except Exception as e:
            self.log_error("Generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate response: {str(e)}")
    
    async def generate_stream(
        self,
        messages: List[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 512,
        **kwargs
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response"""
        if not self.is_loaded:
            raise ModelNotLoadedError("Model not loaded")
        
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
            
            # Prepare input
            chat_input = self._prepare_chat_input(messages)
            
            # Tokenize input
            inputs = self.tokenizer(
                chat_input,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=settings.max_length - params['max_tokens']
            ).to(self.device)
            
            # Create streamer
            streamer = TextIteratorStreamer(
                self.tokenizer,
                skip_prompt=True,
                skip_special_tokens=True
            )
            
            # Generation parameters
            generation_kwargs = {
                **inputs,
                'max_new_tokens': params['max_tokens'],
                'temperature': params['temperature'],
                'top_p': params['top_p'],
                'top_k': params['top_k'],
                'do_sample': True,
                'pad_token_id': self.tokenizer.pad_token_id,
                'eos_token_id': self.tokenizer.eos_token_id,
                'repetition_penalty': 1.1,
                'no_repeat_ngram_size': 3,
                'streamer': streamer
            }
            
            # Start generation in a separate thread
            generation_thread = Thread(
                target=self.model.generate,
                kwargs=generation_kwargs
            )
            generation_thread.start()
            
            # Stream the response
            for chunk_text in streamer:
                if chunk_text:  # Skip empty chunks
                    yield StreamChunk(
                        content=chunk_text,
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
            
            # Wait for generation thread to complete
            generation_thread.join()
            
        except Exception as e:
            self.log_error("Streaming generation failed", error=str(e), model=self.model_name)
            raise GenerationError(f"Failed to generate streaming response: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        info = {
            "name": self.model_name,
            "type": "local_huggingface",
            "loaded": self.is_loaded,
            "device": self.device,
            "capabilities": self.capabilities,
            "parameters": self.parameters
        }
        
        if self.model and hasattr(self.model, 'config'):
            info["model_config"] = {
                "vocab_size": getattr(self.model.config, 'vocab_size', None),
                "hidden_size": getattr(self.model.config, 'hidden_size', None),
                "num_layers": getattr(self.model.config, 'num_hidden_layers', None),
                "num_attention_heads": getattr(self.model.config, 'num_attention_heads', None),
            }
        
        return info
