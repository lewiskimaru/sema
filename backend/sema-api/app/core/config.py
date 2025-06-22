"""
Application configuration and settings
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Application Info
    app_name: str = "Sema Translation API"
    app_version: str = "2.0.0"
    description: str = "Enterprise-grade translation API supporting 200+ languages"
    environment: str = "development"
    debug: bool = True
    
    # API Configuration
    max_text_length: int = 5000
    max_requests_per_minute: int = 60
    max_requests_per_hour: int = 1000
    
    # Security
    allowed_hosts: List[str] = ["*"]
    cors_origins: List[str] = ["*"]
    
    # Models
    model_repo_id: str = "sematech/sema-utils"
    translation_model: str = "sematrans-3.3B"
    beam_size: int = 1
    device: str = "cpu"
    
    # Monitoring
    enable_metrics: bool = True
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_prefix = "SEMA_"


# Global settings instance
settings = Settings()
