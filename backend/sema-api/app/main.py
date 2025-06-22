"""
Sema Translation API - Main Application
Enterprise-grade translation API with proper FastAPI structure
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .core.config import settings
from .core.logging import configure_logging, get_logger
from .middleware.request_middleware import request_middleware
from .services.translation import load_models
from .api.v1.endpoints import router as v1_router, limiter

# Configure logging
configure_logging()
logger = get_logger()


def create_application() -> FastAPI:
    """Create and configure the FastAPI application"""

    app = FastAPI(
        title=settings.app_name,
        description="""
Enterprise translation API supporting 200+ languages with automatic language detection.

**Key Features:**
- Automatic language detection
- 200+ FLORES-200 language support
- Rate limiting (60 req/min per IP)
- Character limit (5000 chars per request)
- Prometheus metrics and monitoring
- Request tracking with unique IDs

**Endpoints:**
- `/translate` - Main translation endpoint
- `/detect-language` - Language detection
- `/languages` - Supported languages information
- `/health` - System health monitoring
- `/metrics` - Prometheus metrics
        """,
        version=settings.app_version,
        docs_url="/",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        contact={
            "name": "Sema AI Team",
            "url": "https://github.com/lewiskimaru/sema",
            "email": "support@sema.ai"
        },
        license_info={
            "name": "MIT License",
            "url": "https://opensource.org/licenses/MIT"
        },
        servers=[
            {
                "url": "https://sematech-sema-api.hf.space",
                "description": "Production server"
            },
            {
                "url": "http://localhost:8000",
                "description": "Development server"
            }
        ]
    )

    # Add rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Security middleware
    if settings.allowed_hosts != ["*"]:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    # Request middleware
    app.middleware("http")(request_middleware)

    # Include API routes
    app.include_router(v1_router, prefix="/api/v1")
    # Include routes at root level (excluding root path which is now Swagger UI)
    app.include_router(v1_router, prefix="", include_in_schema=False)

    return app


# Create the application instance
app = create_application()


@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("application_startup", version=settings.app_version, environment=settings.environment)

    print(f"\n[INFO] Starting {settings.app_name} v{settings.app_version}")
    print("[INFO] Loading translation models...")

    try:
        load_models()
        logger.info("models_loaded_successfully")
        print("[SUCCESS] API started successfully")
        print(f"[CONFIG] Metrics enabled: {settings.enable_metrics}")
        print(f"[CONFIG] Environment: {settings.environment}")
        print(f"[ENDPOINT] Documentation: / (Swagger UI)")
        print(f"[ENDPOINT] Metrics: /metrics")
        print(f"[ENDPOINT] Health: /health")
        print(f"[ENDPOINT] Status: /status")
        print(f"[ENDPOINT] API v1: /api/v1/")
        print()

    except Exception as e:
        logger.error("startup_failed", error=str(e))
        print(f"[ERROR] Startup failed: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("application_shutdown")
    print("\n[INFO] Shutting down Sema Translation API...")
    print("[INFO] Cleaning up resources...")
    print("[SUCCESS] Shutdown complete\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
