"""
Sema Chat API - Main Application
Modern chatbot API with streaming capabilities and flexible model backends
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import RedirectResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import time

from .core.config import settings
from .core.logging import configure_logging, get_logger
from .services.chat_manager import initialize_chat_manager, shutdown_chat_manager
from .api.v1.endpoints import router as v1_router, limiter

# Configure logging
configure_logging()
logger = get_logger()

# Application startup time
startup_time = time.time()


def create_application() -> FastAPI:
    """Create and configure the FastAPI application"""

    # Create FastAPI app
    app = FastAPI(
        title=settings.app_name,
        description="Modern chatbot API with streaming capabilities and flexible model backends",
        version=settings.app_version,
        docs_url="/docs" if settings.debug else "/",  # Swagger UI at root for HF Spaces
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # Add rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add trusted host middleware for production
    if settings.environment == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"]  # Configure appropriately for production
        )

    # Add request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = str(id(request))
        return response

    # Include API routes
    app.include_router(v1_router, prefix="/api/v1", tags=["Chat API v1"])

    # Root redirect for HuggingFace Spaces
    @app.get("/", include_in_schema=False)
    async def root():
        """Redirect root to docs for HuggingFace Spaces"""
        return RedirectResponse(url="/docs")

    return app


# Create the application instance
app = create_application()


@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("application_startup",
               version=settings.app_version,
               environment=settings.environment,
               model_type=settings.model_type,
               model_name=settings.model_name)

    print(f"\n🚀 Starting {settings.app_name} v{settings.app_version}")
    print(f"📊 Environment: {settings.environment}")
    print(f"🤖 Model Backend: {settings.model_type}")
    print(f"🎯 Model: {settings.model_name}")
    print("🔄 Initializing chat services...")

    try:
        # Initialize chat manager (which initializes model and session managers)
        success = await initialize_chat_manager()

        if success:
            logger.info("chat_services_initialized")
            print("✅ Chat services initialized successfully")
            print(f"🌐 API Documentation: http://localhost:7860/docs")
            print(f"📡 WebSocket Chat: ws://localhost:7860/api/v1/chat/ws")
            print(f"🔄 Streaming Chat: http://localhost:7860/api/v1/chat/stream")
            print(f"💬 Regular Chat: http://localhost:7860/api/v1/chat")
            print(f"❤️  Health Check: http://localhost:7860/api/v1/health")

            if settings.enable_metrics:
                print(f"📈 Metrics: http://localhost:7860/api/v1/metrics")

            print("\n🎉 Sema Chat API is ready for conversations!")
            print("=" * 60)
        else:
            logger.error("chat_services_initialization_failed")
            print("❌ Failed to initialize chat services")
            print("🔧 Please check your configuration and try again")
            raise RuntimeError("Chat services initialization failed")

    except Exception as e:
        logger.error("startup_failed", error=str(e))
        print(f"💥 Startup failed: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("application_shutdown")
    print("\n🛑 Shutting down Sema Chat API...")

    try:
        await shutdown_chat_manager()
        print("✅ Chat services shutdown complete")
    except Exception as e:
        logger.error("shutdown_failed", error=str(e))
        print(f"⚠️  Shutdown warning: {e}")

    print("👋 Goodbye!\n")


# Health check endpoint at app level
@app.get("/health", tags=["Health"])
async def app_health():
    """Simple app-level health check"""
    uptime = time.time() - startup_time
    return {
        "status": "healthy",
        "service": "sema-chat-api",
        "version": settings.app_version,
        "uptime_seconds": uptime,
        "model_type": settings.model_type,
        "model_name": settings.model_name
    }


# Status endpoint
@app.get("/status", tags=["Health"])
async def app_status():
    """Simple status endpoint"""
    return {
        "status": "ok",
        "service": "sema-chat-api",
        "version": settings.app_version,
        "environment": settings.environment
    }


if __name__ == "__main__":
    import uvicorn

    print(f"🚀 Starting Sema Chat API on {settings.host}:7860")
    print(f"🔧 Debug mode: {settings.debug}")
    print(f"🤖 Model: {settings.model_type}/{settings.model_name}")

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=7860,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
