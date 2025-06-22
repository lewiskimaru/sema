---
title: Sema Chat API
emoji: 💬
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
short_description: Chat with llms
---

# Sema Chat API 💬

Modern chatbot API with streaming capabilities, flexible model backends, and production-ready features. Built with FastAPI and designed for rapid GenAI advancements.

## 🚀 Quick Start with Gemma

### Option 1: Automated HuggingFace Spaces Deployment
```bash
cd backend/sema-chat
./setup_huggingface.sh
```

### Option 2: Manual Local Setup
```bash
cd backend/sema-chat
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env

# For Gemma via Google AI Studio (Recommended)
# Edit .env:
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it
GOOGLE_API_KEY=your_google_api_key

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 7860
```

### Option 3: Local Gemma (Free, No API Key)
```bash
# Edit .env:
MODEL_TYPE=local
MODEL_NAME=google/gemma-2b-it
DEVICE=cpu

# Run (will download model on first run)
uvicorn app.main:app --reload --host 0.0.0.0 --port 7860
```

## 🌐 Access Your API

Once running, access:
- **Swagger UI**: http://localhost:7860/
- **Health Check**: http://localhost:7860/api/v1/health
- **Chat Endpoint**: http://localhost:7860/api/v1/chat

## 🧪 Quick Test

```bash
# Test chat
curl -X POST "http://localhost:7860/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you introduce yourself?",
    "session_id": "test-session"
  }'

# Test streaming
curl -N -H "Accept: text/event-stream" \
  "http://localhost:7860/api/v1/chat/stream?message=Tell%20me%20about%20AI&session_id=test"
```

## 🎯 Features

### Core Capabilities
- ✅ **Real-time Streaming**: Server-Sent Events and WebSocket support
- ✅ **Multiple Model Backends**: Local, HuggingFace API, OpenAI, Anthropic, Google AI, MiniMax
- ✅ **Session Management**: Persistent conversation contexts
- ✅ **Rate Limiting**: Built-in protection with configurable limits
- ✅ **Health Monitoring**: Comprehensive health checks and metrics

### Supported Models
- **Local**: TinyLlama, DialoGPT, Gemma, Qwen
- **Google AI**: Gemma-2-9b-it, Gemini-1.5-flash, Gemini-1.5-pro
- **OpenAI**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Anthropic**: Claude-3-haiku, Claude-3-sonnet, Claude-3-opus
- **HuggingFace API**: Any model via Inference API
- **MiniMax**: M1 model with reasoning capabilities

## 🔧 Configuration

### Environment Variables
```bash
# Model Backend (local, google, openai, anthropic, hf_api, minimax)
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it

# API Keys (as needed)
GOOGLE_API_KEY=your_key
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
HF_API_TOKEN=your_token
MINIMAX_API_KEY=your_key

# Generation Settings
TEMPERATURE=0.7
MAX_NEW_TOKENS=512
TOP_P=0.9

# Server Settings
HOST=0.0.0.0
PORT=7860
DEBUG=false
```

## 📚 Documentation

- **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Detailed setup for all backends
- **[HuggingFace Deployment](HUGGINGFACE_DEPLOYMENT.md)** - Step-by-step deployment guide
- **[API Documentation](http://localhost:7860/)** - Interactive Swagger UI

## 🧪 Testing

```bash
# Run comprehensive tests
python tests/test_api.py

# Test different backends
python examples/test_backends.py

# Test specific backend
python examples/test_backends.py --backend google
```

## 🚀 Deployment

### HuggingFace Spaces (Recommended)
1. Run the setup script: `./setup_huggingface.sh`
2. Create your Space on HuggingFace
3. Push the generated code
4. Set environment variables in Space settings
5. Your API will be live at: `https://username-spacename.hf.space/`

### Docker
```bash
docker build -t sema-chat-api .
docker run -e MODEL_TYPE=google \
           -e GOOGLE_API_KEY=your_key \
           -p 7860:7860 \
           sema-chat-api
```

## 🔗 API Endpoints

### Chat
- **`POST /api/v1/chat`** - Send chat message
- **`GET /api/v1/chat/stream`** - Streaming chat (SSE)
- **`WebSocket /api/v1/chat/ws`** - Real-time WebSocket chat

### Sessions
- **`GET /api/v1/sessions/{id}`** - Get conversation history
- **`DELETE /api/v1/sessions/{id}`** - Clear conversation
- **`GET /api/v1/sessions`** - List active sessions

### System
- **`GET /api/v1/health`** - Comprehensive health check
- **`GET /api/v1/model/info`** - Current model information
- **`GET /api/v1/status`** - Basic status

## 💡 Why This Architecture?

1. **Future-Proof**: Modular design adapts to rapid GenAI advancements
2. **Flexible**: Switch between local models and APIs with environment variables
3. **Production-Ready**: Rate limiting, monitoring, error handling built-in
4. **Cost-Effective**: Start free with local models, scale with APIs
5. **Developer-Friendly**: Comprehensive docs, tests, and examples

## 🛠️ Development

### Project Structure
```
app/
├── main.py                     # FastAPI application
├── api/v1/endpoints.py         # API routes
├── core/
│   ├── config.py              # Environment-based configuration
│   └── logging.py             # Structured logging
├── models/schemas.py           # Pydantic request/response models
├── services/
│   ├── chat_manager.py        # Chat orchestration
│   ├── model_manager.py       # Backend selection
│   ├── session_manager.py     # Conversation management
│   └── model_backends/        # Model implementations
└── utils/helpers.py           # Utility functions
```

### Adding New Backends
1. Create new backend in `app/services/model_backends/`
2. Inherit from `ModelBackend` base class
3. Implement required methods
4. Add to `ModelManager._create_backend()`
5. Update configuration and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **HuggingFace** for model hosting and Spaces platform
- **Google** for Gemma models and AI Studio
- **FastAPI** for the excellent web framework
- **OpenAI, Anthropic, MiniMax** for their APIs

---

**Ready to chat? Deploy your Sema Chat API today! 🚀💬**
