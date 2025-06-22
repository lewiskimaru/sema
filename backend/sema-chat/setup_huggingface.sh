#!/bin/bash

# 🚀 Sema Chat API - HuggingFace Spaces Setup Script
# This script helps you deploy Sema Chat API to HuggingFace Spaces with Gemma

set -e

echo "🚀 Sema Chat API - HuggingFace Spaces Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: Please run this script from the backend/sema-chat directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: app/main.py, requirements.txt, Dockerfile"
    exit 1
fi

echo "✅ Found Sema Chat API files"

# Get user input
read -p "📝 Enter your HuggingFace username: " HF_USERNAME
read -p "📝 Enter your Space name (e.g., sema-chat-gemma): " SPACE_NAME
read -p "🔑 Enter your Google AI API key (or press Enter to skip): " GOOGLE_API_KEY

# Validate inputs
if [ -z "$HF_USERNAME" ]; then
    echo "❌ Error: HuggingFace username is required"
    exit 1
fi

if [ -z "$SPACE_NAME" ]; then
    echo "❌ Error: Space name is required"
    exit 1
fi

SPACE_URL="https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"
SPACE_REPO="https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"

echo ""
echo "📋 Configuration Summary:"
echo "   HuggingFace Username: $HF_USERNAME"
echo "   Space Name: $SPACE_NAME"
echo "   Space URL: $SPACE_URL"
echo "   Google AI Key: ${GOOGLE_API_KEY:+[PROVIDED]}${GOOGLE_API_KEY:-[NOT PROVIDED]}"
echo ""

read -p "🤔 Continue with deployment? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Create deployment directory
DEPLOY_DIR="../sema-chat-deploy"
echo "📁 Creating deployment directory: $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy all files
echo "📋 Copying files..."
cp -r . "$DEPLOY_DIR/"
cd "$DEPLOY_DIR"

# Create README.md for the Space
echo "📝 Creating Space README..."
cat > README.md << EOF
---
title: Sema Chat API
emoji: 💬
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
license: mit
short_description: Modern chatbot API with Gemma integration and streaming capabilities
---

# Sema Chat API 💬

Modern chatbot API with streaming capabilities, powered by Google's Gemma model.

## 🚀 Features

- **Real-time Streaming**: Server-Sent Events and WebSocket support
- **Gemma Integration**: Powered by Google's Gemma 2 9B model
- **Session Management**: Persistent conversation contexts
- **RESTful API**: Clean, documented endpoints
- **Interactive UI**: Built-in Swagger documentation

## 🔗 API Endpoints

- **Chat**: \`POST /api/v1/chat\`
- **Streaming**: \`GET /api/v1/chat/stream\`
- **WebSocket**: \`ws://space-url/api/v1/chat/ws\`
- **Health**: \`GET /api/v1/health\`
- **Docs**: \`GET /\` (Swagger UI)

## 💬 Quick Test

\`\`\`bash
curl -X POST "https://$HF_USERNAME-$SPACE_NAME.hf.space/api/v1/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello! Can you introduce yourself?",
    "session_id": "test-session"
  }'
\`\`\`

## 🔄 Streaming Test

\`\`\`bash
curl -N -H "Accept: text/event-stream" \\
  "https://$HF_USERNAME-$SPACE_NAME.hf.space/api/v1/chat/stream?message=Tell%20me%20about%20AI&session_id=test"
\`\`\`

## ⚙️ Configuration

This Space is configured to use Google's Gemma model via AI Studio. 
Set your \`GOOGLE_API_KEY\` in the Space settings to enable the API.

## 🛠️ Built With

- **FastAPI**: Modern Python web framework
- **Google Gemma**: Advanced language model
- **Docker**: Containerized deployment
- **HuggingFace Spaces**: Hosting platform

---

Created by $HF_USERNAME | Powered by Sema AI
EOF

# Create .gitignore
echo "🚫 Creating .gitignore..."
cat > .gitignore << EOF
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

.pytest_cache/
.coverage
htmlcov/

.DS_Store
.vscode/
.idea/

logs/
*.log
EOF

# Initialize git repository
echo "🔧 Initializing git repository..."
git init
git remote add origin "$SPACE_REPO"

# Create initial commit
echo "📦 Creating initial commit..."
git add .
git commit -m "Initial deployment of Sema Chat API with Gemma support

Features:
- Google Gemma 2 9B integration
- Real-time streaming responses
- Session management
- RESTful API with Swagger docs
- WebSocket support
- Health monitoring

Configuration:
- MODEL_TYPE=google
- MODEL_NAME=gemma-2-9b-it
- Port: 7860 (HuggingFace standard)
"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Create your HuggingFace Space:"
echo "   → Go to: https://huggingface.co/spaces"
echo "   → Click 'Create new Space'"
echo "   → Name: $SPACE_NAME"
echo "   → SDK: Docker"
echo "   → License: MIT"
echo ""
echo "2. Push your code:"
echo "   → cd $DEPLOY_DIR"
echo "   → git push origin main"
echo ""
echo "3. Configure environment variables in Space settings:"
if [ -n "$GOOGLE_API_KEY" ]; then
echo "   → MODEL_TYPE=google"
echo "   → MODEL_NAME=gemma-2-9b-it"
echo "   → GOOGLE_API_KEY=$GOOGLE_API_KEY"
else
echo "   → MODEL_TYPE=google"
echo "   → MODEL_NAME=gemma-2-9b-it"
echo "   → GOOGLE_API_KEY=your_google_api_key_here"
echo ""
echo "   🔑 Get your Google AI API key from: https://aistudio.google.com/"
fi
echo "   → DEBUG=false"
echo "   → ENVIRONMENT=production"
echo ""
echo "4. Wait for build and test:"
echo "   → Space URL: $SPACE_URL"
echo "   → API Docs: $SPACE_URL/"
echo "   → Health Check: $SPACE_URL/api/v1/health"
echo ""
echo "🚀 Your Sema Chat API will be live at:"
echo "   $SPACE_URL"
echo ""
echo "Happy deploying! 💬✨"
