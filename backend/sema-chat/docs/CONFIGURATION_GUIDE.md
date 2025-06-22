# 🔧 Sema Chat API Configuration Guide

## 🎯 **MiniMax Integration**

### Configuration
```bash
MODEL_TYPE=minimax
MODEL_NAME=MiniMax-M1
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_API_URL=https://api.minimax.chat/v1/text/chatcompletion_v2
MINIMAX_MODEL_VERSION=abab6.5s-chat
```

### Features
- ✅ **Reasoning Capabilities**: Shows model's thinking process
- ✅ **Streaming Support**: Real-time response generation
- ✅ **Custom API Integration**: Direct integration with MiniMax API
- ✅ **Reasoning Content**: Displays both reasoning and final response

### Example Usage
```bash
curl -X POST "http://localhost:7860/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Solve this math problem: 2x + 5 = 15",
    "session_id": "minimax-test"
  }'
```

**Response includes reasoning:**
```json
{
  "message": "[Reasoning: I need to solve for x. First, subtract 5 from both sides: 2x = 10. Then divide by 2: x = 5]\n\nTo solve 2x + 5 = 15:\n1. Subtract 5 from both sides: 2x = 10\n2. Divide by 2: x = 5\n\nTherefore, x = 5.",
  "session_id": "minimax-test",
  "model_name": "MiniMax-M1"
}
```

---

## 🔥 **Gemma Integration**

### Option 1: Local Gemma (Free Tier)
```bash
MODEL_TYPE=local
MODEL_NAME=google/gemma-2b-it
DEVICE=auto
```

### Option 2: Gemma via HuggingFace API
```bash
MODEL_TYPE=hf_api
MODEL_NAME=google/gemma-2b-it
HF_API_TOKEN=your_hf_token
```

### Option 3: Gemma via Google AI Studio
```bash
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it
GOOGLE_API_KEY=your_google_api_key
```

### Available Gemma Models
- **gemma-2-2b-it** (2B parameters, instruction-tuned)
- **gemma-2-9b-it** (9B parameters, instruction-tuned)
- **gemma-2-27b-it** (27B parameters, instruction-tuned)
- **gemini-1.5-flash** (Fast, efficient)
- **gemini-1.5-pro** (Most capable)

### Example Usage
```bash
curl -X POST "http://localhost:7860/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum computing in simple terms",
    "session_id": "gemma-test",
    "temperature": 0.7
  }'
```

---

## 🚀 **Complete Backend Comparison**

| Backend | Cost | Setup | Streaming | Special Features |
|---------|------|-------|-----------|------------------|
| **Local** | Free | Medium | ✅ | Offline, Private |
| **HF API** | Free/Paid | Easy | ✅ | Many models |
| **OpenAI** | Paid | Easy | ✅ | High quality |
| **Anthropic** | Paid | Easy | ✅ | Long context |
| **MiniMax** | Paid | Easy | ✅ | Reasoning |
| **Google** | Free/Paid | Easy | ✅ | Multimodal |

---

## 🔧 **Configuration Examples**

### Free Tier Setup (HuggingFace Spaces)
```bash
# Best for free deployment
MODEL_TYPE=local
MODEL_NAME=TinyLlama/TinyLlama-1.1B-Chat-v1.0
DEVICE=cpu
MAX_NEW_TOKENS=256
TEMPERATURE=0.7
```

### Production Setup (API-based)
```bash
# Best for production with fallbacks
MODEL_TYPE=openai
MODEL_NAME=gpt-3.5-turbo
OPENAI_API_KEY=your_key

# Fallback configuration
FALLBACK_MODEL_TYPE=hf_api
FALLBACK_MODEL_NAME=microsoft/DialoGPT-medium
HF_API_TOKEN=your_token
```

### Research Setup (Multiple Models)
```bash
# Primary: Latest Gemini
MODEL_TYPE=google
MODEL_NAME=gemini-1.5-pro
GOOGLE_API_KEY=your_key

# For reasoning tasks
REASONING_MODEL_TYPE=minimax
REASONING_MODEL_NAME=MiniMax-M1
MINIMAX_API_KEY=your_key
```

---

## 🎯 **Model Selection Guide**

### For **Free Deployment** (HuggingFace Spaces):
1. **TinyLlama/TinyLlama-1.1B-Chat-v1.0** - Smallest, fastest
2. **microsoft/DialoGPT-medium** - Better conversations
3. **Qwen/Qwen2.5-0.5B-Instruct** - Good instruction following

### For **Reasoning Tasks**:
1. **MiniMax M1** - Shows thinking process
2. **Claude-3 Opus** - Deep reasoning
3. **GPT-4** - Complex problem solving

### For **Conversations**:
1. **Claude-3 Haiku** - Natural, fast
2. **GPT-3.5-turbo** - Balanced cost/quality
3. **Gemini-1.5-flash** - Fast, capable

### For **Multilingual**:
1. **Gemma-2-9b-it** - Good multilingual
2. **GPT-4** - Excellent multilingual
3. **Local models** - Depends on training

---

## 🔄 **Dynamic Model Switching**

The API supports runtime model switching:

```python
# Switch to MiniMax for reasoning
POST /api/v1/model/switch
{
  "model_type": "minimax",
  "model_name": "MiniMax-M1"
}

# Switch back to fast model
POST /api/v1/model/switch
{
  "model_type": "google",
  "model_name": "gemini-1.5-flash"
}
```

---

## 🧪 **Testing Your Setup**

### Test All Backends
```bash
python examples/test_backends.py
```

### Test Specific Backend
```bash
# Test MiniMax
MINIMAX_API_KEY=your_key python -c "
import asyncio
from app.services.model_backends.minimax_api import MiniMaxAPIBackend
from app.models.schemas import ChatMessage

async def test():
    backend = MiniMaxAPIBackend('MiniMax-M1', api_key='your_key', api_url='your_url')
    await backend.load_model()
    messages = [ChatMessage(role='user', content='Hello')]
    response = await backend.generate_response(messages)
    print(response.message)

asyncio.run(test())
"
```

### Test Gemma
```bash
# Test local Gemma
MODEL_TYPE=local MODEL_NAME=google/gemma-2b-it python tests/test_api.py

# Test Gemma via Google AI
MODEL_TYPE=google MODEL_NAME=gemma-2-9b-it GOOGLE_API_KEY=your_key python tests/test_api.py
```

---

## 🚀 **Deployment Examples**

### HuggingFace Spaces (Free)
```yaml
# In your Space settings
MODEL_TYPE: local
MODEL_NAME: TinyLlama/TinyLlama-1.1B-Chat-v1.0
DEVICE: cpu
```

### HuggingFace Spaces (With API)
```yaml
# In your Space settings
MODEL_TYPE: google
MODEL_NAME: gemma-2-9b-it
GOOGLE_API_KEY: your_secret_key
```

### Docker Deployment
```bash
docker run -e MODEL_TYPE=minimax \
           -e MINIMAX_API_KEY=your_key \
           -e MINIMAX_API_URL=your_url \
           -p 8000:7860 \
           sema-chat-api
```

---

## 💡 **Pro Tips**

1. **Start Small**: Begin with TinyLlama for testing
2. **Use APIs for Production**: More reliable than local models
3. **Enable Streaming**: Better user experience
4. **Monitor Usage**: Track API costs and limits
5. **Have Fallbacks**: Configure multiple backends
6. **Test Thoroughly**: Use the provided test scripts

---

## 🔗 **Getting API Keys**

- **HuggingFace**: https://huggingface.co/settings/tokens
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google AI**: https://aistudio.google.com/
- **MiniMax**: Contact MiniMax for API access

---

**Your architecture is now ready for both MiniMax and Gemma! 🎉**
