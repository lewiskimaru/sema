# Sema Translation API - Architecture Overview

## 🏗️ Project Structure

This FastAPI application follows industry best practices for maintainable, scalable APIs:

### Directory Structure
```
app/
├── main.py                     # Application entry point & FastAPI instance
├── api/v1/endpoints.py         # API route handlers (versioned)
├── core/                       # Core configuration & setup
│   ├── config.py              # Settings management
│   ├── logging.py             # Structured logging setup
│   └── metrics.py             # Prometheus metrics definitions
├── middleware/                 # Custom middleware
│   └── request_middleware.py  # Request tracking & metrics
├── models/schemas.py           # Pydantic data models
├── services/translation.py    # Business logic & model management
└── utils/helpers.py           # Utility functions
```

## 🔧 Design Principles

### 1. Separation of Concerns
- **API Layer**: Route definitions and request/response handling
- **Service Layer**: Business logic and model operations
- **Core Layer**: Configuration, logging, and metrics
- **Models Layer**: Data validation and serialization

### 2. Dependency Injection
- Settings injected via Pydantic Settings
- Services accessed through proper imports
- Middleware applied declaratively

### 3. Configuration Management
- Environment-based configuration
- Type-safe settings with Pydantic
- Centralized configuration in `core/config.py`

### 4. Observability
- Structured JSON logging with structlog
- Prometheus metrics for monitoring
- Request tracking with unique IDs
- Health check endpoints

## 🚀 Key Features

### Enterprise-Grade Features
- **Rate Limiting**: IP-based rate limiting with SlowAPI
- **Request Tracking**: Unique request IDs for debugging
- **Metrics Collection**: Prometheus metrics for monitoring
- **Structured Logging**: JSON logs for easy parsing
- **Health Checks**: Comprehensive health monitoring

### API Design
- **Versioned Routes**: `/api/v1/` for future compatibility
- **OpenAPI Documentation**: Auto-generated Swagger UI
- **Type Safety**: Full Pydantic validation
- **Error Handling**: Graceful error responses

### Performance
- **Async/Await**: Full asynchronous request handling
- **Model Caching**: Models loaded once at startup
- **Efficient Translation**: CTranslate2 optimization

## 🔒 Security (Testing Phase)

### Current State
- Authentication **removed** for testing phase
- Rate limiting active (60 req/min per IP)
- Input validation with Pydantic
- CORS configured for development

### Future Integration Points
- Supabase authentication ready
- User tracking infrastructure in place
- Usage analytics for billing prepared

## 📊 Monitoring & Observability

### Metrics Available
- Request count by endpoint and status
- Request duration histograms
- Translation count by language pair
- Character count tracking
- Error count by type

### Logging
- Structured JSON logs
- Request/response tracking
- Translation event logging
- Error logging with context

## 🔄 Development Workflow

### Local Development
```bash
cd backend/sema-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker Development
```bash
docker build -t sema-api .
docker run -p 8000:8000 sema-api
```

### Testing
- Health check: `GET /health`
- Documentation: `GET /docs`
- Metrics: `GET /metrics`
- Translation: `POST /translate`

## 🎯 Future Enhancements

### Authentication Integration
- Supabase JWT validation
- User-based rate limiting
- API key authentication

### Scaling Considerations
- Database integration for usage tracking
- Redis caching for performance
- Load balancer compatibility
- Horizontal scaling support

### Monitoring Enhancements
- Grafana dashboards
- Alerting rules
- Performance profiling
- Usage analytics

## 📝 Maintenance

### Code Organization Benefits
- **Testability**: Each component can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features and endpoints
- **Debugging**: Structured logging and request tracking
- **Documentation**: Self-documenting code structure

### Adding New Features
1. **New Endpoints**: Add to `api/v1/endpoints.py`
2. **Business Logic**: Add to appropriate service in `services/`
3. **Data Models**: Add to `models/schemas.py`
4. **Configuration**: Add to `core/config.py`
5. **Middleware**: Add to `middleware/`

This architecture provides a solid foundation for a production-ready translation API that can scale and evolve with your needs.
