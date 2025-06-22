"""
Structured logging configuration for Sema Chat API
"""

import logging
import sys
from typing import Any, Dict
import structlog
from .config import settings


def configure_logging():
    """Configure structured logging for the application"""
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if settings.structured_logging else structlog.dev.ConsoleRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )
    
    # Configure file logging if specified
    if settings.log_file:
        file_handler = logging.FileHandler(settings.log_file)
        file_handler.setLevel(getattr(logging, settings.log_level.upper()))
        
        if settings.structured_logging:
            file_handler.setFormatter(logging.Formatter('%(message)s'))
        else:
            file_handler.setFormatter(
                logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
            )
        
        logging.getLogger().addHandler(file_handler)


def get_logger(name: str = None) -> structlog.BoundLogger:
    """Get a structured logger instance"""
    return structlog.get_logger(name)


class LoggerMixin:
    """Mixin class to add logging capabilities to any class"""
    
    @property
    def logger(self) -> structlog.BoundLogger:
        """Get logger for this class"""
        return get_logger(self.__class__.__name__)
    
    def log_info(self, message: str, **kwargs: Any):
        """Log info message with context"""
        self.logger.info(message, **kwargs)
    
    def log_error(self, message: str, **kwargs: Any):
        """Log error message with context"""
        self.logger.error(message, **kwargs)
    
    def log_warning(self, message: str, **kwargs: Any):
        """Log warning message with context"""
        self.logger.warning(message, **kwargs)
    
    def log_debug(self, message: str, **kwargs: Any):
        """Log debug message with context"""
        self.logger.debug(message, **kwargs)
