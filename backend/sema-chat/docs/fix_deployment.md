# 🔧 Quick Fix for HuggingFace Deployment

## ❌ **Issue Identified**
The build failed due to **Pydantic v2 compatibility issues**:
- `BaseSettings` moved to `pydantic-settings` package
- `Config` class syntax changed to `model_config`
- `@validator` changed to `@field_validator`

## ✅ **Fixes Applied**

### 1. Updated requirements.txt
```diff
+ pydantic-settings
```

### 2. Fixed app/core/config.py
```diff
- from pydantic import BaseSettings, Field
+ from pydantic import Field
+ from pydantic_settings import BaseSettings

- class Config:
-     env_file = ".env"
-     case_sensitive = False
+ model_config = {
+     "env_file": ".env", 
+     "case_sensitive": False
+ }
```

### 3. Fixed app/models/schemas.py
```diff
- from pydantic import BaseModel, Field, validator
+ from pydantic import BaseModel, Field, field_validator, ConfigDict

- @validator('role')
- def validate_role(cls, v):
+ @field_validator('role')
+ @classmethod
+ def validate_role(cls, v):

- class Config:
-     json_schema_extra = {...}
+ model_config = ConfigDict(
+     json_schema_extra={...}
+ )
```

## 🚀 **Quick Deployment Fix**

### Option 1: Update Your Existing Space
1. Go to your HuggingFace Space: https://huggingface.co/spaces/sematech/sema-chat
2. Click "Files" tab
3. Update these files with the fixed versions:
   - `requirements.txt`
   - `app/core/config.py` 
   - `app/models/schemas.py`

### Option 2: Re-run Setup Script
```bash
cd backend/sema-chat
./setup_huggingface.sh
```
Then push the updated files to your Space.

### Option 3: Manual Git Update
```bash
# Clone your space
git clone https://huggingface.co/spaces/sematech/sema-chat
cd sema-chat

# Copy fixed files
cp /path/to/sema/backend/sema-chat/requirements.txt .
cp /path/to/sema/backend/sema-chat/app/core/config.py app/core/
cp /path/to/sema/backend/sema-chat/app/models/schemas.py app/models/

# Commit and push
git add .
git commit -m "Fix Pydantic v2 compatibility issues

- Add pydantic-settings dependency
- Update BaseSettings import
- Fix Config class syntax
- Update validator decorators"
git push
```

## 🎯 **Environment Variables for Gemma**

Make sure these are set in your Space settings:
```
MODEL_TYPE=local
MODEL_NAME=google/gemma-2b-it
DEVICE=cpu
TEMPERATURE=0.7
MAX_NEW_TOKENS=256
DEBUG=false
ENVIRONMENT=production
```

**Alternative (API-based):**
```
MODEL_TYPE=google
MODEL_NAME=gemma-2-9b-it
GOOGLE_API_KEY=your_google_api_key_here
DEBUG=false
ENVIRONMENT=production
```

## 🧪 **Test After Fix**

Once the Space rebuilds successfully:
```bash
# Health check
curl https://sematech-sema-chat.hf.space/health

# Chat test
curl -X POST "https://sematech-sema-chat.hf.space/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! Can you introduce yourself?", "session_id": "test"}'
```

## 📋 **Build Status**
- ❌ **Before**: Pydantic import errors
- ✅ **After**: Should build successfully with Pydantic v2

The fixes ensure compatibility with the latest Pydantic version while maintaining all functionality.

---

**Your Space should now deploy successfully! 🚀**
