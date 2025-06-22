---
title: Sema Translation API
emoji: 🌍
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
short_description: Enterprise-grade translation API with 200+ language support
---

# Sema Translation API 🌍

Enterprise-grade translation API supporting 200+ languages with automatic language detection, rate limiting, usage tracking, and comprehensive monitoring. Built with FastAPI and powered by the consolidated `sematech/sema-utils` model repository.

## 🚀 Features

### Core Translation
- **Automatic Language Detection**: Detects source language automatically if not provided
- **200+ Language Support**: Supports all FLORES-200 language codes
- **High-Performance Translation**: Uses CTranslate2 for optimized inference
- **Character Count Tracking**: Monitors usage for billing and analytics

### Enterprise Features
- **Rate Limiting**: 60 requests/minute, 1000 requests/hour per IP
- **Request Tracking**: Unique request IDs for debugging and monitoring
- **Usage Analytics**: Comprehensive metrics with Prometheus integration
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Health Monitoring**: Detailed health checks for system monitoring

### Security & Reliability
- **Input Validation**: Comprehensive request validation with Pydantic
- **Error Handling**: Graceful error handling with detailed error responses
- **CORS Support**: Configurable cross-origin resource sharing
- **Future-Ready Auth**: Designed for Supabase authentication integration

### API Quality
- **OpenAPI Documentation**: Auto-generated Swagger UI and ReDoc
- **Type Safety**: Full TypeScript-compatible API schemas
- **Production Ready**: Follows FastAPI production best practices

## 📁 Project Structure

```
app/
├── __init__.py
├── main.py                     # Application entry point
├── api/                        # API route definitions
│   ├── __init__.py
│   └── v1/                     # Versioned API routes
│       ├── __init__.py
│       └── endpoints.py        # Route handlers
├── core/                       # Core configuration
│   ├── __init__.py
│   ├── config.py              # Settings and configuration
│   ├── logging.py             # Logging configuration
│   └── metrics.py             # Prometheus metrics
├── middleware/                 # Custom middleware
│   ├── __init__.py
│   └── request_middleware.py  # Request tracking middleware
├── models/                     # Data models
│   ├── __init__.py
│   └── schemas.py             # Pydantic models
├── services/                   # Business logic
│   ├── __init__.py
│   └── translation.py         # Translation service
└── utils/                      # Utility functions
    ├── __init__.py
    └── helpers.py             # Helper functions
```

## 🔗 API Endpoints

### Health & Monitoring
- **`GET /`** - Interactive Swagger UI documentation
- **`GET /status`** - Basic health check
- **`GET /health`** - Detailed health monitoring
- **`GET /metrics`** - Prometheus metrics
- **`GET /redoc`** - ReDoc documentation

### Translation
- **`POST /translate`** - Main translation endpoint
- **`POST /api/v1/translate`** - Versioned translation endpoint

### Request/Response Examples

**Translation Request:**
```json
{
  "text": "Habari ya asubuhi",
  "target_language": "eng_Latn",
  "source_language": "swh_Latn"  // Optional
}
```

**Translation Response:**
```json
{
  "translated_text": "Good morning",
  "source_language": "swh_Latn",
  "target_language": "eng_Latn",
  "inference_time": 0.234,
  "character_count": 17,
  "timestamp": "Monday | 2024-06-21 | 14:30:25",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Language Codes

This API uses FLORES-200 language codes. Some common examples:

- `eng_Latn` - English
- `swh_Latn` - Swahili
- `kik_Latn` - Kikuyu
- `luo_Latn` - Luo
- `fra_Latn` - French
- `spa_Latn` - Spanish

## Usage Examples

### Python
```python
import requests

response = requests.post("https://your-space-url/translate", json={
    "text": "Habari ya asubuhi",
    "target_language": "eng_Latn"
})

print(response.json())
```

### cURL
```bash
curl -X POST "https://your-space-url/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Wĩ mwega?",
    "source_language": "kik_Latn",
    "target_language": "eng_Latn"
  }'
```

## Model Information

This API uses models from the consolidated `sematech/sema-utils` repository:

- **Translation Model**: `sematrans-3.3B` (CTranslate2 optimized)
- **Language Detection**: `lid218e.bin` (FastText)
- **Tokenization**: `spm.model` (SentencePiece)

## API Documentation

Once the Space is running, visit `/docs` for interactive API documentation.

---

Created by Lewis Kamau Kimaru | Sema AI
