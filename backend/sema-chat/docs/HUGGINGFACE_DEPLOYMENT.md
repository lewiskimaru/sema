# 🚀 HuggingFace Spaces Deployment Guide

## 📋 **Quick Setup for Gemma**

### Step 1: Create Your HuggingFace Space
1. Go to [HuggingFace Spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Choose:
   - **Space name**: `your-username/sema-chat-gemma`
   - **License**: MIT
   - **Space SDK**: Docker
   - **Space hardware**: CPU basic (free) or T4 small (paid)

### Step 2: Clone and Upload Files
```bash
# Clone your new space
git clone https://huggingface.co/spaces/your-username/sema-chat-gemma
cd sema-chat-gemma

# Copy all files from backend/sema-chat/
cp -r /path/to/sema/backend/sema-chat/* .

# Add and commit
git add .
git commit -m "Initial Sema Chat API with Gemma support"
git push
```

### Step 3: Configure Environment Variables
In your Space settings, add these environment variables:

#### **Option A: Local Gemma (Free Tier)**
```
MODEL_TYPE=local
MODEL_NAME=google/gemma-2b-it
DEVICE=cpu
TEMPERATURE=0.7
MAX_NEW_TOKENS=256
DEBUG=false
ENVIRONMENT=production
```

#### **Option B: Gemma via Google AI Studio (Recommended)**
```
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it
GOOGLE_API_KEY=your_google_api_key_here
TEMPERATURE=0.7
MAX_NEW_TOKENS=512
DEBUG=false
ENVIRONMENT=production
```

#### **Option C: Gemma via HuggingFace API**
```
MODEL_TYPE=hf_api
MODEL_NAME=google/gemma-2b-it
HF_API_TOKEN=your_hf_token_here
TEMPERATURE=0.7
MAX_NEW_TOKENS=512
DEBUG=false
ENVIRONMENT=production
```

---

## 🔑 **Getting API Keys**

### Google AI Studio API Key (Recommended)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create a new API key
5. Copy the key and add it to your Space settings

### HuggingFace API Token (Alternative)
1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Choose **"Read"** access
4. Copy the token and add it to your Space settings

---

## 📁 **Required Files Structure**

Make sure your Space has these files:
```
your-space/
├── app/                    # Main application code
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── README.md              # Space documentation
└── .gitignore             # Git ignore file
```

---

## 🐳 **Dockerfile Configuration**

Your Dockerfile should be:
```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 user
USER user

# Expose port 7860 (HuggingFace Spaces standard)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Start the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

---

## 🎯 **Recommended Configuration for First Version**

For your first deployment, I recommend **Google AI Studio** with Gemma:

### Environment Variables:
```
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it
GOOGLE_API_KEY=your_api_key_here
TEMPERATURE=0.7
MAX_NEW_TOKENS=512
DEBUG=false
ENVIRONMENT=production
ENABLE_STREAMING=true
RATE_LIMIT=30
SESSION_TIMEOUT=30
```

### Why This Setup?
- ✅ **Fast deployment** - No model download needed
- ✅ **Reliable** - Google's infrastructure
- ✅ **Cost-effective** - Free tier available
- ✅ **Good performance** - Gemma 2 9B is capable
- ✅ **Streaming support** - Real-time responses

---

## 🧪 **Testing Your Deployment**

### 1. Check Health
```bash
curl https://your-username-sema-chat-gemma.hf.space/health
```

### 2. Test Chat
```bash
curl -X POST "https://your-username-sema-chat-gemma.hf.space/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you introduce yourself?",
    "session_id": "test-session"
  }'
```

### 3. Test Streaming
```bash
curl -N -H "Accept: text/event-stream" \
  "https://your-username-sema-chat-gemma.hf.space/api/v1/chat/stream?message=Tell%20me%20about%20AI&session_id=test"
```

### 4. Access Swagger UI
Visit: `https://your-username-sema-chat-gemma.hf.space/`

---

## 🔧 **Troubleshooting**

### Common Issues:

#### 1. **Space Won't Start**
- Check logs in Space settings
- Verify all required files are present
- Check Dockerfile syntax

#### 2. **Model Loading Fails**
- Verify API key is correct
- Check model name spelling
- Try a smaller model first

#### 3. **API Errors**
- Check environment variables
- Verify network connectivity
- Review application logs

#### 4. **Slow Responses**
- Use smaller model (gemma-2-2b-it)
- Reduce MAX_NEW_TOKENS
- Enable streaming for better UX

### Debug Commands:
```bash
# Check environment variables
curl https://your-space.hf.space/api/v1/model/info

# Check detailed health
curl https://your-space.hf.space/api/v1/health

# View logs in Space settings
```

---

## 🚀 **Step-by-Step Deployment**

### 1. Prepare Your Space
```bash
# Create and clone your space
git clone https://huggingface.co/spaces/your-username/sema-chat-gemma
cd sema-chat-gemma

# Copy files
cp -r ../sema/backend/sema-chat/* .
```

### 2. Set Environment Variables
Go to your Space settings and add:
```
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it
GOOGLE_API_KEY=your_key_here
```

### 3. Deploy
```bash
git add .
git commit -m "Deploy Sema Chat with Gemma"
git push
```

### 4. Wait for Build
- Space will automatically build (5-10 minutes)
- Check build logs for any errors
- Once running, test the endpoints

### 5. Share Your Space
Your API will be available at:
`https://your-username-sema-chat-gemma.hf.space/`

---

## 💡 **Pro Tips**

1. **Start with Google AI Studio** - Easiest setup
2. **Use environment variables** - Never hardcode API keys
3. **Enable streaming** - Better user experience
4. **Monitor usage** - Check API quotas
5. **Test thoroughly** - Use the provided test scripts
6. **Document your API** - Swagger UI is auto-generated

---

## 🎉 **You're Ready!**

With this setup, you'll have a production-ready chatbot API with:
- ✅ Gemma 2 9B model via Google AI Studio
- ✅ Streaming responses
- ✅ Session management
- ✅ Rate limiting
- ✅ Health monitoring
- ✅ Interactive Swagger UI

**Your Space URL will be:**
`https://your-username-sema-chat-gemma.hf.space/`

Happy deploying! 🚀
