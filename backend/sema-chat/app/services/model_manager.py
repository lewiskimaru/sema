"""
Model Manager - Central hub for managing different model backends
Handles backend selection based on environment configuration
"""

from typing import Optional, Dict, Any
from ..core.config import settings
from ..core.logging import LoggerMixin
from .model_backends.base import ModelBackend, ModelBackendError
from .model_backends.local_hf import LocalHuggingFaceBackend
from .model_backends.hf_api import HuggingFaceAPIBackend
from .model_backends.openai_api import OpenAIAPIBackend
from .model_backends.anthropic_api import AnthropicAPIBackend
from .model_backends.minimax_api import MiniMaxAPIBackend
from .model_backends.google_api import GoogleAIBackend


class ModelManager(LoggerMixin):
    """
    Central manager for model backends
    Handles initialization, switching, and management of different model types
    """

    def __init__(self):
        self.current_backend: Optional[ModelBackend] = None
        self.backend_type = settings.model_type.lower()
        self.model_name = settings.model_name
        self.is_initialized = False

    async def initialize(self) -> bool:
        """
        Initialize the model backend based on configuration

        Returns:
            bool: True if initialization successful, False otherwise
        """
        try:
            self.log_info("Initializing model manager",
                         backend_type=self.backend_type,
                         model_name=self.model_name)

            # Validate configuration
            if not settings.validate_model_config():
                self.log_error("Invalid model configuration", backend_type=self.backend_type)
                return False

            # Create the appropriate backend
            backend = self._create_backend()
            if not backend:
                self.log_error("Failed to create backend", backend_type=self.backend_type)
                return False

            # Load the model
            success = await backend.load_model()
            if success:
                self.current_backend = backend
                self.is_initialized = True
                self.log_info("Model manager initialized successfully",
                             backend_type=self.backend_type,
                             model_name=self.model_name)
                return True
            else:
                self.log_error("Failed to load model", backend_type=self.backend_type)
                return False

        except Exception as e:
            self.log_error("Model manager initialization failed",
                          error=str(e),
                          backend_type=self.backend_type)
            return False

    def _create_backend(self) -> Optional[ModelBackend]:
        """Create the appropriate model backend based on configuration"""
        try:
            if self.backend_type == "local":
                return LocalHuggingFaceBackend(
                    model_name=self.model_name,
                    device=settings.device,
                    temperature=settings.temperature,
                    max_tokens=settings.max_new_tokens,
                    top_p=settings.top_p,
                    top_k=settings.top_k
                )

            elif self.backend_type == "hf_api":
                return HuggingFaceAPIBackend(
                    model_name=self.model_name,
                    api_token=settings.hf_api_token,
                    inference_url=settings.hf_inference_url,
                    temperature=settings.temperature,
                    max_tokens=settings.max_new_tokens,
                    top_p=settings.top_p
                )

            elif self.backend_type == "openai":
                return OpenAIAPIBackend(
                    model_name=self.model_name,
                    api_key=settings.openai_api_key,
                    org_id=settings.openai_org_id,
                    temperature=settings.temperature,
                    max_tokens=settings.max_new_tokens,
                    top_p=settings.top_p
                )

            elif self.backend_type == "anthropic":
                return AnthropicAPIBackend(
                    model_name=self.model_name,
                    api_key=settings.anthropic_api_key,
                    temperature=settings.temperature,
                    max_tokens=settings.max_new_tokens,
                    top_p=settings.top_p
                )

            elif self.backend_type == "minimax":
                return MiniMaxAPIBackend(
                    model_name=self.model_name,
                    api_key=settings.minimax_api_key,
                    api_url=settings.minimax_api_url,
                    model_version=settings.minimax_model_version,
                    temperature=settings.temperature,
                    max_tokens=settings.max_new_tokens,
                    top_p=settings.top_p
                )

            elif self.backend_type == "google":
                return GoogleAIBackend(
                    model_name=self.model_name,
                    api_key=settings.google_api_key,
                    temperature=settings.temperature,
                    max_tokens=settings.max_new_tokens,
                    top_p=settings.top_p,
                    top_k=settings.top_k
                )

            else:
                self.log_error("Unsupported backend type", backend_type=self.backend_type)
                return None

        except Exception as e:
            self.log_error("Failed to create backend", error=str(e), backend_type=self.backend_type)
            return None

    async def shutdown(self) -> bool:
        """
        Shutdown the current backend and cleanup resources

        Returns:
            bool: True if shutdown successful, False otherwise
        """
        try:
            if self.current_backend:
                success = await self.current_backend.unload_model()
                self.current_backend = None
                self.is_initialized = False
                self.log_info("Model manager shutdown successfully")
                return success
            return True

        except Exception as e:
            self.log_error("Model manager shutdown failed", error=str(e))
            return False

    def get_backend(self) -> Optional[ModelBackend]:
        """
        Get the current model backend

        Returns:
            ModelBackend: Current backend instance or None if not initialized
        """
        return self.current_backend

    def is_ready(self) -> bool:
        """
        Check if the model manager is ready for inference

        Returns:
            bool: True if ready, False otherwise
        """
        return (self.is_initialized and
                self.current_backend is not None and
                self.current_backend.is_model_loaded())

    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model

        Returns:
            Dict containing model information
        """
        if not self.current_backend:
            return {
                "status": "not_initialized",
                "backend_type": self.backend_type,
                "model_name": self.model_name,
                "is_ready": False
            }

        info = self.current_backend.get_model_info()
        info.update({
            "is_ready": self.is_ready(),
            "manager_initialized": self.is_initialized
        })

        return info

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a comprehensive health check

        Returns:
            Dict containing health status
        """
        if not self.is_ready():
            return {
                "status": "unhealthy",
                "reason": "manager_not_ready",
                "backend_type": self.backend_type,
                "model_name": self.model_name,
                "is_initialized": self.is_initialized,
                "backend_loaded": self.current_backend is not None
            }

        # Delegate to backend health check
        backend_health = await self.current_backend.health_check()

        # Add manager-level information
        backend_health.update({
            "manager_status": "healthy",
            "backend_type": self.backend_type,
            "is_ready": self.is_ready()
        })

        return backend_health

    async def switch_model(self, new_model_name: str, new_backend_type: Optional[str] = None) -> bool:
        """
        Switch to a different model (and optionally backend type)

        Args:
            new_model_name: Name of the new model
            new_backend_type: Optional new backend type

        Returns:
            bool: True if switch successful, False otherwise
        """
        try:
            self.log_info("Switching model",
                         current_model=self.model_name,
                         new_model=new_model_name,
                         current_backend=self.backend_type,
                         new_backend=new_backend_type)

            # Shutdown current backend
            if self.current_backend:
                await self.current_backend.unload_model()
                self.current_backend = None

            # Update configuration
            old_model_name = self.model_name
            old_backend_type = self.backend_type

            self.model_name = new_model_name
            if new_backend_type:
                self.backend_type = new_backend_type.lower()

            # Try to initialize new backend
            success = await self.initialize()

            if not success:
                # Rollback on failure
                self.log_warning("Model switch failed, rolling back",
                               failed_model=new_model_name,
                               rollback_model=old_model_name)

                self.model_name = old_model_name
                self.backend_type = old_backend_type
                await self.initialize()  # Try to restore previous state

                return False

            self.log_info("Model switch successful",
                         new_model=new_model_name,
                         new_backend=self.backend_type)
            return True

        except Exception as e:
            self.log_error("Model switch failed", error=str(e))
            return False

    def get_supported_backends(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about supported backends

        Returns:
            Dict containing backend information
        """
        return {
            "local": {
                "name": "Local HuggingFace",
                "description": "Run models locally using transformers",
                "requires": ["model_name", "device"],
                "capabilities": ["chat", "streaming", "offline"],
                "example_models": [
                    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                    "microsoft/DialoGPT-medium",
                    "Qwen/Qwen2.5-0.5B-Instruct"
                ]
            },
            "hf_api": {
                "name": "HuggingFace Inference API",
                "description": "Use HuggingFace's hosted inference API",
                "requires": ["model_name", "hf_api_token"],
                "capabilities": ["chat", "streaming", "serverless"],
                "example_models": [
                    "microsoft/DialoGPT-large",
                    "microsoft/phi-2",
                    "google/gemma-2b-it"
                ]
            },
            "openai": {
                "name": "OpenAI API",
                "description": "Use OpenAI's GPT models",
                "requires": ["model_name", "openai_api_key"],
                "capabilities": ["chat", "streaming", "function_calling"],
                "example_models": [
                    "gpt-3.5-turbo",
                    "gpt-4",
                    "gpt-4-turbo"
                ]
            },
            "anthropic": {
                "name": "Anthropic API",
                "description": "Use Anthropic's Claude models",
                "requires": ["model_name", "anthropic_api_key"],
                "capabilities": ["chat", "streaming", "long_context"],
                "example_models": [
                    "claude-3-haiku-20240307",
                    "claude-3-sonnet-20240229",
                    "claude-3-opus-20240229"
                ]
            },
            "minimax": {
                "name": "MiniMax API",
                "description": "Use MiniMax's M1 model with reasoning capabilities",
                "requires": ["model_name", "minimax_api_key", "minimax_api_url"],
                "capabilities": ["chat", "streaming", "reasoning"],
                "example_models": [
                    "MiniMax-M1"
                ]
            },
            "google": {
                "name": "Google AI Studio",
                "description": "Use Google's Gemma and other models via AI Studio",
                "requires": ["model_name", "google_api_key"],
                "capabilities": ["chat", "streaming", "multimodal"],
                "example_models": [
                    "gemini-1.5-flash",
                    "gemini-1.5-pro",
                    "gemma-2-9b-it",
                    "gemma-2-27b-it"
                ]
            }
        }


# Global model manager instance
model_manager = ModelManager()


async def get_model_manager() -> ModelManager:
    """Get the global model manager instance"""
    return model_manager


async def initialize_model_manager() -> bool:
    """Initialize the global model manager"""
    return await model_manager.initialize()


async def shutdown_model_manager() -> bool:
    """Shutdown the global model manager"""
    return await model_manager.shutdown()
