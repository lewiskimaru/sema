# Deployment Architecture & Infrastructure

## 🏗️ Current Architecture

### HuggingFace Spaces Deployment

**Platform:** HuggingFace Spaces  
**Runtime:** Python 3.9+ with FastAPI  
**URL:** `https://sematech-sema-api.hf.space`  
**Auto-deployment:** Connected to Git repository

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Sema Translation API                     │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Application Server                                 │
│  ├── API Endpoints (v1)                                     │
│  ├── Request Middleware (Rate Limiting, Logging)           │
│  ├── Authentication (Future)                               │
│  └── Response Middleware (CORS, Headers)                   │
├─────────────────────────────────────────────────────────────┤
│  Translation Services                                       │
│  ├── CTranslate2 Translation Engine                        │
│  ├── SentencePiece Tokenizer                              │
│  ├── FastText Language Detection                           │
│  └── Language Database (FLORES-200)                        │
├─────────────────────────────────────────────────────────────┤
│  Custom HuggingFace Models                                 │
│  ├── sematech/sema-utils Repository                        │
│  ├── NLLB-200 3.3B (CTranslate2 Optimized)               │
│  ├── FastText LID.176 Model                               │
│  └── SentencePiece Tokenizer                              │
├─────────────────────────────────────────────────────────────┤
│  Monitoring & Observability                                │
│  ├── Prometheus Metrics                                    │
│  ├── Structured Logging (JSON)                            │
│  ├── Request Tracking (UUID)                              │
│  └── Performance Timing                                    │
└─────────────────────────────────────────────────────────────┘
```

### Model Storage & Caching

**HuggingFace Hub Integration:**
```python
# Model loading from unified repository
model_path = snapshot_download(
    repo_id="sematech/sema-utils",
    cache_dir="/app/models",
    local_files_only=False
)

# Local caching strategy
CACHE_STRUCTURE = {
    "/app/models/": {
        "sematech--sema-utils/": {
            "translation/": {
                "nllb-200-3.3B-ct2/": "CTranslate2 model files",
                "tokenizer/": "SentencePiece tokenizer"
            },
            "language_detection/": {
                "lid.176.bin": "FastText model"
            }
        }
    }
}
```

## 🚀 Deployment Process

### 1. HuggingFace Spaces Configuration

**Space Configuration (`README.md`):**
```yaml
---
title: Sema Translation API
emoji: 🌍
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
app_port: 8000
---
```

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Environment Configuration

**Environment Variables:**
```bash
# Application settings
APP_NAME="Sema Translation API"
APP_VERSION="2.0.0"
ENVIRONMENT="production"

# Model settings
MODEL_CACHE_DIR="/app/models"
HF_HOME="/app/models"

# API settings
MAX_CHARACTERS=5000
RATE_LIMIT_PER_MINUTE=60

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL="INFO"

# HuggingFace Hub
HF_TOKEN="your_token_here"  # Optional for private models
```

### 3. Startup Process

**Application Initialization:**
```python
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    print("[INFO] Starting Sema Translation API v2.0.0")
    print("[INFO] Loading translation models...")
    
    try:
        # Load models from HuggingFace Hub
        load_models()
        
        # Initialize metrics
        if settings.enable_metrics:
            setup_prometheus_metrics()
        
        # Setup logging
        configure_structured_logging()
        
        print("[SUCCESS] API started successfully")
        print(f"[CONFIG] Environment: {settings.environment}")
        print(f"[ENDPOINT] Documentation: / (Swagger UI)")
        print(f"[ENDPOINT] API v1: /api/v1/")
        
    except Exception as e:
        print(f"[ERROR] Startup failed: {e}")
        raise
```

## 📊 Performance Characteristics

### Resource Requirements

**Memory Usage:**
- **Model Loading**: ~3.2GB RAM
- **Per Request**: 50-100MB additional
- **Concurrent Requests**: Linear scaling
- **Peak Usage**: ~4-5GB with multiple concurrent requests

**CPU Usage:**
- **Model Inference**: CPU-intensive (CTranslate2 optimized)
- **Language Detection**: Minimal CPU usage
- **Request Processing**: Low overhead
- **Recommended**: 4+ CPU cores for production

**Storage:**
- **Model Files**: ~2.8GB total
- **Application Code**: ~50MB
- **Logs**: Variable (recommend log rotation)
- **Cache**: Automatic HuggingFace Hub caching

### Performance Benchmarks

**Translation Speed:**
```
Text Length     | Inference Time | Total Response Time
----------------|----------------|--------------------
< 50 chars      | 0.2-0.5s      | 0.3-0.7s
50-200 chars    | 0.5-1.2s      | 0.7-1.5s
200-500 chars   | 1.2-2.5s      | 1.5-3.0s
500+ chars      | 2.5-5.0s      | 3.0-6.0s
```

**Language Detection Speed:**
```
Text Length     | Detection Time
----------------|---------------
Any length      | 0.01-0.05s
```

**Concurrent Request Handling:**
```
Concurrent Users | Response Time (95th percentile)
-----------------|--------------------------------
1-5 users        | < 2 seconds
5-10 users       | < 3 seconds
10-20 users      | < 5 seconds
20+ users        | May require scaling
```

## 🔧 Monitoring & Observability

### Prometheus Metrics

**Available Metrics:**
```python
# Request metrics
sema_requests_total{endpoint, status}
sema_request_duration_seconds{endpoint}

# Translation metrics
sema_translations_total{source_lang, target_lang}
sema_characters_translated_total
sema_translation_duration_seconds{source_lang, target_lang}

# Language detection metrics
sema_language_detections_total{detected_lang}
sema_detection_duration_seconds

# Error metrics
sema_errors_total{error_type, endpoint}

# System metrics
sema_model_load_time_seconds
sema_memory_usage_bytes
```

**Metrics Endpoint:**
```bash
curl https://sematech-sema-api.hf.space/metrics
```

### Structured Logging

**Log Format:**
```json
{
  "timestamp": "2024-06-21T14:30:25.123Z",
  "level": "INFO",
  "event": "translation_request",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "source_language": "swh_Latn",
  "target_language": "eng_Latn",
  "character_count": 17,
  "inference_time": 0.234,
  "total_time": 1.234,
  "client_ip": "192.168.1.1"
}
```

### Health Monitoring

**Health Check Endpoints:**
```bash
# Basic status
curl https://sematech-sema-api.hf.space/status

# Detailed health
curl https://sematech-sema-api.hf.space/health

# Model validation
curl https://sematech-sema-api.hf.space/health | jq '.models_loaded'
```

## 🔄 CI/CD Pipeline

### Automated Deployment

**Git Integration:**
1. **Code Push**: Push to main branch
2. **Auto-Build**: HuggingFace Spaces builds Docker image
3. **Model Download**: Automatic model download from `sematech/sema-utils`
4. **Health Check**: Automatic health validation
5. **Live Deployment**: Zero-downtime deployment

**Deployment Validation:**
```bash
# Automated health check after deployment
curl -f https://sematech-sema-api.hf.space/health || exit 1

# Test translation functionality
curl -X POST https://sematech-sema-api.hf.space/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target_language": "swh_Latn"}' || exit 1
```

### Model Updates

**Model Versioning Strategy:**
```python
# Check for model updates
def check_model_updates():
    """Check if models need updating"""
    try:
        repo_info = api.repo_info("sematech/sema-utils")
        local_commit = get_local_commit_hash()
        
        if local_commit != repo_info.sha:
            logger.info("model_update_available")
            return True
        return False
    except Exception as e:
        logger.error("update_check_failed", error=str(e))
        return False

# Graceful model reloading
async def reload_models():
    """Reload models without downtime"""
    global translator, tokenizer, language_detector
    
    # Download updated models
    new_model_path = download_models()
    
    # Load new models
    new_translator = load_translation_model(new_model_path)
    new_tokenizer = load_tokenizer(new_model_path)
    new_detector = load_detection_model(new_model_path)
    
    # Atomic swap
    translator = new_translator
    tokenizer = new_tokenizer
    language_detector = new_detector
    
    logger.info("models_reloaded_successfully")
```

## 🔒 Security Considerations

### Current Security Measures

**Input Validation:**
- Pydantic schema validation
- Character length limits
- Content type validation
- Request size limits

**Rate Limiting:**
- IP-based rate limiting (60 req/min)
- Sliding window implementation
- Graceful degradation

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Future Security Enhancements

**Authentication & Authorization:**
- API key management
- JWT token validation
- Role-based access control
- Usage quotas per user

**Enhanced Security:**
- Request signing
- IP whitelisting
- DDoS protection
- Input sanitization

## 🚀 Scaling Considerations

### Horizontal Scaling

**Load Balancing Strategy:**
```nginx
upstream sema_api {
    server sema-api-1.hf.space;
    server sema-api-2.hf.space;
    server sema-api-3.hf.space;
}

server {
    listen 80;
    location / {
        proxy_pass http://sema_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Auto-scaling Triggers:**
- CPU usage > 80%
- Memory usage > 85%
- Response time > 5 seconds
- Queue length > 10 requests

### Performance Optimization

**Caching Strategy:**
- Redis for translation caching
- CDN for static content
- Model result caching
- Language metadata caching

**Database Integration:**
- PostgreSQL for user data
- Analytics database for metrics
- Read replicas for scaling
- Connection pooling

This architecture provides a solid foundation for scaling the Sema API to handle enterprise-level traffic while maintaining high performance and reliability.
