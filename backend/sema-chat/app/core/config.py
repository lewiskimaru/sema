"""
Configuration management for Sema Chat API
Environment-driven settings for flexible model backends
"""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # =============================================================================
    # APPLICATION SETTINGS
    # =============================================================================

    app_name: str = Field(default="Sema Chat API", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")

    # =============================================================================
    # SERVER SETTINGS
    # =============================================================================

    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=7860, env="PORT")
    cors_origins: List[str] = Field(default=["*"], env="CORS_ORIGINS")

    # =============================================================================
    # MODEL CONFIGURATION
    # =============================================================================

    model_type: str = Field(default="local", env="MODEL_TYPE")
    model_name: str = Field(default="TinyLlama/TinyLlama-1.1B-Chat-v1.0", env="MODEL_NAME")

    # Local model settings
    device: str = Field(default="auto", env="DEVICE")
    max_length: int = Field(default=2048, env="MAX_LENGTH")
    temperature: float = Field(default=0.7, env="TEMPERATURE")
    top_p: float = Field(default=0.9, env="TOP_P")
    top_k: int = Field(default=50, env="TOP_K")
    max_new_tokens: int = Field(default=512, env="MAX_NEW_TOKENS")

    # =============================================================================
    # API KEYS AND TOKENS
    # =============================================================================

    # HuggingFace
    hf_api_token: Optional[str] = Field(default=None, env="HF_API_TOKEN")
    hf_inference_url: str = Field(
        default="https://api-inference.huggingface.co/models/",
        env="HF_INFERENCE_URL"
    )

    # OpenAI
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_org_id: Optional[str] = Field(default=None, env="OPENAI_ORG_ID")

    # Anthropic
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")

    # MiniMax
    minimax_api_key: Optional[str] = Field(default=None, env="MINIMAX_API_KEY")
    minimax_api_url: Optional[str] = Field(default=None, env="MINIMAX_API_URL")
    minimax_model_version: Optional[str] = Field(default=None, env="MINIMAX_MODEL_VERSION")

    # Google AI Studio
    google_api_key: Optional[str] = Field(default=None, env="GOOGLE_API_KEY")

    # =============================================================================
    # RATE LIMITING AND PERFORMANCE
    # =============================================================================

    rate_limit: int = Field(default=60, env="RATE_LIMIT")  # requests per minute
    max_concurrent_streams: int = Field(default=10, env="MAX_CONCURRENT_STREAMS")
    stream_delay: float = Field(default=0.01, env="STREAM_DELAY")

    # =============================================================================
    # SESSION MANAGEMENT
    # =============================================================================

    session_timeout: int = Field(default=30, env="SESSION_TIMEOUT")  # minutes
    max_sessions_per_user: int = Field(default=5, env="MAX_SESSIONS_PER_USER")
    max_messages_per_session: int = Field(default=100, env="MAX_MESSAGES_PER_SESSION")

    # =============================================================================
    # STREAMING SETTINGS
    # =============================================================================

    enable_streaming: bool = Field(default=True, env="ENABLE_STREAMING")

    # =============================================================================
    # LOGGING AND MONITORING
    # =============================================================================

    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    structured_logging: bool = Field(default=True, env="STRUCTURED_LOGGING")
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")

    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_path: str = Field(default="/metrics", env="METRICS_PATH")

    # =============================================================================
    # EXTERNAL SERVICES
    # =============================================================================

    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")

    # =============================================================================
    # SECURITY
    # =============================================================================

    api_key: Optional[str] = Field(default=None, env="API_KEY")
    jwt_secret: Optional[str] = Field(default=None, env="JWT_SECRET")

    # =============================================================================
    # SYSTEM PROMPTS
    # =============================================================================

    system_prompt: str = Field(
        default="You are a helpful, harmless, and honest AI assistant. Respond in a friendly and professional manner.",
        env="SYSTEM_PROMPT"
    )

    system_prompt_chat: Optional[str] = Field(default=None, env="SYSTEM_PROMPT_CHAT")
    system_prompt_code: Optional[str] = Field(default=None, env="SYSTEM_PROMPT_CODE")
    system_prompt_creative: Optional[str] = Field(default=None, env="SYSTEM_PROMPT_CREATIVE")

    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }

    def get_system_prompt(self, prompt_type: str = "default") -> str:
        """Get system prompt based on type"""
        if prompt_type == "chat" and self.system_prompt_chat:
            return self.system_prompt_chat
        elif prompt_type == "code" and self.system_prompt_code:
            return self.system_prompt_code
        elif prompt_type == "creative" and self.system_prompt_creative:
            return self.system_prompt_creative
        return self.system_prompt

    def is_local_model(self) -> bool:
        """Check if using local model backend"""
        return self.model_type.lower() == "local"

    def is_api_model(self) -> bool:
        """Check if using API-based model backend"""
        return self.model_type.lower() in ["hf_api", "openai", "anthropic"]

    def validate_model_config(self) -> bool:
        """Validate model configuration based on type"""
        if self.model_type == "hf_api" and not self.hf_api_token:
            return False
        elif self.model_type == "openai" and not self.openai_api_key:
            return False
        elif self.model_type == "anthropic" and not self.anthropic_api_key:
            return False
        elif self.model_type == "minimax" and (not self.minimax_api_key or not self.minimax_api_url):
            return False
        elif self.model_type == "google" and not self.google_api_key:
            return False
        return True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings
