"""
Request middleware for logging, metrics, and request tracking
"""

import time
from fastapi import Request
from ..core.logging import get_logger
from ..core.metrics import REQUEST_COUNT, REQUEST_DURATION, ERROR_COUNT
from ..utils.helpers import generate_request_id

logger = get_logger()


async def request_middleware(request: Request, call_next):
    """Middleware for request tracking, metrics, and logging"""
    start_time = time.time()
    request_id = generate_request_id()

    # Add request ID to request state
    request.state.request_id = request_id

    # Log request
    logger.info(
        "request_started",
        request_id=request_id,
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown")
    )

    try:
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Update metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()

        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

        # Log response
        logger.info(
            "request_completed",
            request_id=request_id,
            status_code=response.status_code,
            duration=duration
        )

        # Add request ID and timing to response headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        response.headers["X-Response-Time-Ms"] = f"{duration * 1000:.1f}"

        return response

    except Exception as e:
        duration = time.time() - start_time

        # Update error metrics
        ERROR_COUNT.labels(error_type=type(e).__name__).inc()

        # Log error
        logger.error(
            "request_failed",
            request_id=request_id,
            error=str(e),
            error_type=type(e).__name__,
            duration=duration
        )

        raise
