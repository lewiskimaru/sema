"""
API v1 endpoints
"""

import time
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

from ...models.schemas import (
    TranslationRequest,
    TranslationResponse,
    HealthResponse,
    LanguagesResponse,
    LanguageStatsResponse,
    LanguageInfo,
    LanguageDetectionRequest,
    LanguageDetectionResponse
)
from ...services.translation import (
    translate_with_detection,
    translate_with_source,
    detect_language,
    models_loaded
)
from ...services.languages import (
    get_all_languages,
    get_languages_by_region,
    get_language_info,
    get_popular_languages,
    get_african_languages,
    search_languages,
    get_language_statistics
)
from ...core.config import settings
from ...core.logging import get_logger
from ...core.metrics import TRANSLATION_COUNT, CHARACTER_COUNT, ERROR_COUNT
from ...utils.helpers import get_nairobi_time

logger = get_logger()
limiter = Limiter(key_func=get_remote_address)

# Application start time for uptime calculation
app_start_time = time.time()

# Create router
router = APIRouter()


@router.get(
    "/status",
    response_model=HealthResponse,
    tags=["Health & Monitoring"],
    summary="Basic Health Check",
    description="Quick health check endpoint that returns basic API status information."
)
async def status_check():
    """
    Basic health check endpoint.

    Returns API status, version, model loading status, and uptime.
    Used for load balancer health checks and basic monitoring.
    """
    uptime = time.time() - app_start_time
    full_date, _ = get_nairobi_time()

    return HealthResponse(
        status="healthy" if models_loaded() else "degraded",
        version=settings.app_version,
        models_loaded=models_loaded(),
        uptime=uptime,
        timestamp=full_date
    )


@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health & Monitoring"],
    summary="Detailed Health Check",
    description="Comprehensive health check with detailed system status for monitoring systems.",
    responses={
        200: {"description": "System is healthy"},
        503: {"description": "System is unhealthy - models not loaded"}
    }
)
async def health_check():
    """
    Detailed health check for monitoring systems.

    Returns comprehensive system status including health, models, uptime, and timestamp.
    Returns 200 if operational, 503 if models not loaded.
    """
    uptime = time.time() - app_start_time
    full_date, _ = get_nairobi_time()

    # Perform additional health checks here
    models_healthy = models_loaded()

    return HealthResponse(
        status="healthy" if models_healthy else "unhealthy",
        version=settings.app_version,
        models_loaded=models_healthy,
        uptime=uptime,
        timestamp=full_date
    )


@router.get(
    "/metrics",
    tags=["Health & Monitoring"],
    summary="Prometheus Metrics",
    description="Prometheus-compatible metrics endpoint for monitoring and alerting.",
    responses={
        200: {"description": "Metrics in Prometheus format", "content": {"text/plain": {}}},
        404: {"description": "Metrics disabled"}
    }
)
async def get_metrics():
    """
    Prometheus metrics endpoint.

    Returns metrics in Prometheus format including request counts, durations,
    translation counts, character counts, and error counts.
    """
    if not settings.enable_metrics:
        raise HTTPException(status_code=404, detail="Metrics disabled")

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.post(
    "/translate",
    response_model=TranslationResponse,
    tags=["Translation"],
    summary="Translate Text",
    description="Translate text between 200+ languages with automatic language detection.",
    responses={
        200: {"description": "Translation successful"},
        400: {"description": "Invalid request - empty text or invalid language code"},
        413: {"description": "Text too long - exceeds character limit"},
        429: {"description": "Rate limit exceeded"},
        500: {"description": "Translation service error"}
    }
)
@limiter.limit(f"{settings.max_requests_per_minute}/minute")
async def translate_endpoint(
    translation_request: TranslationRequest,
    request: Request
):
    """
    Translate text between 200+ languages.

    Supports automatic language detection if source_language not provided.
    Rate limited to 60 requests/minute per IP. Maximum 5000 characters per request.
    Uses FLORES-200 language codes (e.g., eng_Latn, swh_Latn, fra_Latn).

    Returns translated text with source language, inference time, and request tracking.
    """
    request_id = request.state.request_id
    request_start_time = time.time()

    # Validate text length
    if len(translation_request.text) > settings.max_text_length:
        raise HTTPException(
            status_code=413,
            detail=f"Text too long. Maximum {settings.max_text_length} characters allowed."
        )

    full_date, _ = get_nairobi_time()
    character_count = len(translation_request.text)

    # Log translation request
    logger.info(
        "translation_started",
        request_id=request_id,
        source_language=translation_request.source_language,
        target_language=translation_request.target_language,
        character_count=character_count
    )

    try:
        if translation_request.source_language:
            # Use provided source language
            translated_text, inference_time = translate_with_source(
                translation_request.text,
                translation_request.source_language,
                translation_request.target_language
            )
            source_lang = translation_request.source_language
        else:
            # Auto-detect source language
            source_lang, translated_text, inference_time = translate_with_detection(
                translation_request.text,
                translation_request.target_language
            )

        # Update metrics
        TRANSLATION_COUNT.labels(
            source_lang=source_lang,
            target_lang=translation_request.target_language
        ).inc()

        CHARACTER_COUNT.inc(character_count)

        # Log successful translation
        logger.info(
            "translation_completed",
            request_id=request_id,
            source_language=source_lang,
            target_language=translation_request.target_language,
            character_count=character_count,
            inference_time=inference_time
        )

        # Calculate total request time
        total_request_time = time.time() - request_start_time

        return TranslationResponse(
            translated_text=translated_text,
            source_language=source_lang,
            target_language=translation_request.target_language,
            inference_time=inference_time,
            character_count=character_count,
            timestamp=full_date,
            request_id=request_id,
            total_time=total_request_time
        )

    except Exception as e:
        # Log translation error
        logger.error(
            "translation_failed",
            request_id=request_id,
            error=str(e),
            error_type=type(e).__name__,
            source_language=translation_request.source_language,
            target_language=translation_request.target_language
        )

        # Update error metrics
        ERROR_COUNT.labels(error_type="translation_error").inc()

        raise HTTPException(
            status_code=500,
            detail="Translation service temporarily unavailable. Please try again later."
        )


@router.post(
    "/detect-language",
    response_model=LanguageDetectionResponse,
    tags=["Language Detection"],
    summary="Detect Input Language",
    description="Detect the language of input text for multilingual applications.",
    responses={
        200: {"description": "Language detected successfully"},
        400: {"description": "Invalid request - empty text or text too long"},
        429: {"description": "Rate limit exceeded"},
        500: {"description": "Language detection service error"}
    }
)
@limiter.limit(f"{settings.max_requests_per_minute}/minute")
async def detect_language_endpoint(
    detection_request: LanguageDetectionRequest,
    request: Request
):
    """
    Detect the language of input text.

    Returns detected language code, confidence score, and English flag.
    Useful for multilingual chatbots and content routing.
    Rate limited to 60 requests/minute per IP. Maximum 1000 characters.

    Response includes FLORES-200 language code, native name, and confidence score.
    """
    request_id = request.state.request_id
    request_start_time = time.time()

    # Validate text length
    if len(detection_request.text) > 1000:
        raise HTTPException(
            status_code=413,
            detail="Text too long. Maximum 1000 characters allowed for language detection."
        )

    full_date, _ = get_nairobi_time()
    character_count = len(detection_request.text)

    # Log detection request
    logger.info(
        "language_detection_started",
        request_id=request_id,
        character_count=character_count
    )

    try:
        # Detect language
        detected_lang_code, confidence = detect_language(detection_request.text)

        # Get language information
        language_info = get_language_info(detected_lang_code)

        # Handle case where language is not in our database (fallback)
        if not language_info:
            language_name = detected_lang_code
            native_name = detected_lang_code
        else:
            language_name = language_info["name"]
            native_name = language_info["native_name"]

        # Check if detected language is English
        is_english = detected_lang_code in ["eng_Latn", "eng_Arab"]

        # Log successful detection
        logger.info(
            "language_detection_completed",
            request_id=request_id,
            detected_language=detected_lang_code,
            confidence=confidence,
            is_english=is_english,
            character_count=character_count
        )

        # Calculate total request time
        total_request_time = time.time() - request_start_time

        return LanguageDetectionResponse(
            detected_language=detected_lang_code,
            language_name=language_name,
            native_name=native_name,
            confidence=confidence,
            is_english=is_english,
            character_count=character_count,
            timestamp=full_date,
            request_id=request_id,
            total_time=total_request_time
        )

    except Exception as e:
        # Log detection error
        logger.error(
            "language_detection_failed",
            request_id=request_id,
            error=str(e),
            error_type=type(e).__name__,
            character_count=character_count
        )

        # Update error metrics
        ERROR_COUNT.labels(error_type="language_detection_error").inc()

        raise HTTPException(
            status_code=500,
            detail="Language detection service temporarily unavailable. Please try again later."
        )


@router.get(
    "/languages",
    response_model=LanguagesResponse,
    tags=["Languages"],
    summary="Get All Supported Languages",
    description="Retrieve a complete list of all supported languages with metadata."
)
async def get_languages():
    """
    Get all supported languages.

    Returns 200+ languages with English names, native names, regions, and scripts.
    Useful for building language selectors and validation.
    """
    languages = get_all_languages()
    return LanguagesResponse(
        languages={code: LanguageInfo(**info) for code, info in languages.items()},
        total_count=len(languages)
    )


@router.get(
    "/languages/popular",
    response_model=LanguagesResponse,
    tags=["Languages"],
    summary="Get Popular Languages",
    description="Get the most commonly used languages for quick access."
)
async def get_popular_languages_endpoint():
    """
    Get popular languages for quick selection.

    Returns commonly used languages including major global, Asian, and African languages.
    Useful for mobile apps and quick language selection interfaces.
    """
    languages = get_popular_languages()
    return LanguagesResponse(
        languages={code: LanguageInfo(**info) for code, info in languages.items()},
        total_count=len(languages)
    )


@router.get(
    "/languages/african",
    response_model=LanguagesResponse,
    tags=["Languages"],
    summary="Get African Languages",
    description="Get all supported African languages."
)
async def get_african_languages_endpoint():
    """
    Get all supported African languages.

    Returns African languages from East, West, Southern, and Central Africa.
    Includes languages with Latin and Ethiopic scripts.
    """
    languages = get_african_languages()
    return LanguagesResponse(
        languages={code: LanguageInfo(**info) for code, info in languages.items()},
        total_count=len(languages)
    )


@router.get(
    "/languages/region/{region}",
    response_model=LanguagesResponse,
    tags=["Languages"],
    summary="Get Languages by Region",
    description="Get all languages from a specific geographic region."
)
async def get_languages_by_region_endpoint(region: str):
    """
    Get languages filtered by geographic region.

    Available regions: Africa, Europe, Asia, Middle East, Americas.
    Returns languages specific to the requested region.
    """
    languages = get_languages_by_region(region)
    if not languages:
        raise HTTPException(
            status_code=404,
            detail=f"No languages found for region: {region}. Available regions: Africa, Europe, Asia, Middle East, Americas"
        )

    return LanguagesResponse(
        languages={code: LanguageInfo(**info) for code, info in languages.items()},
        total_count=len(languages)
    )


@router.get(
    "/languages/search",
    response_model=LanguagesResponse,
    tags=["Languages"],
    summary="Search Languages",
    description="Search for languages by name, native name, or language code."
)
async def search_languages_endpoint(q: str):
    """
    Search languages by name, native name, or language code.

    Supports partial matching and searches across English names, native names, and codes.
    Minimum 2 characters required. Useful for autocomplete and validation.
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Search query must be at least 2 characters long"
        )

    languages = search_languages(q.strip())
    return LanguagesResponse(
        languages={code: LanguageInfo(**info) for code, info in languages.items()},
        total_count=len(languages)
    )


@router.get(
    "/languages/stats",
    response_model=LanguageStatsResponse,
    tags=["Languages"],
    summary="Get Language Statistics",
    description="Get comprehensive statistics about supported languages."
)
async def get_language_stats():
    """
    Get language support statistics.

    Returns total language count, regional distribution, script coverage,
    and detailed breakdown by region. Useful for analytics and reporting.
    """
    stats = get_language_statistics()
    return LanguageStatsResponse(**stats)


@router.get(
    "/languages/{language_code}",
    response_model=LanguageInfo,
    tags=["Languages"],
    summary="Get Language Information",
    description="Get detailed information about a specific language."
)
async def get_language_info_endpoint(language_code: str):
    """
    Get information about a specific language.

    Returns English name, native name, region, and script for the given FLORES-200 code.
    Useful for language validation and UI display.
    """
    language_info = get_language_info(language_code)
    if not language_info:
        raise HTTPException(
            status_code=404,
            detail=f"Language code '{language_code}' not supported. Use /languages to see all supported languages."
        )

    return LanguageInfo(**language_info)
