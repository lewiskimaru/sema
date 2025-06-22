# 🚨 URGENT FIX for HuggingFace Space

## ❌ **New Error Identified**
The rate limiter (`slowapi`) requires a `request` parameter in function signatures, but our functions didn't have it properly positioned.

## ✅ **Quick Fix**

### 1. Update `app/api/v1/endpoints.py`

**Find this line (around line 55):**
```python
async def chat(request: ChatRequest, req: Request):
```

**Replace with:**
```python
async def chat(chat_request: ChatRequest, request: Request):
```

**Find this line (around line 92):**
```python
async def chat_stream(
    message: str = Query(..., description="Chat message"),
    session_id: str = Query(..., description="Session ID"),
    system_prompt: Optional[str] = Query(None, description="Custom system prompt"),
    temperature: Optional[float] = Query(None, ge=0.0, le=1.0, description="Temperature"),
    max_tokens: Optional[int] = Query(None, ge=1, le=2048, description="Max tokens"),
    req: Request = None
):
```

**Replace with:**
```python
async def chat_stream(
    request: Request,
    message: str = Query(..., description="Chat message"),
    session_id: str = Query(..., description="Session ID"),
    system_prompt: Optional[str] = Query(None, description="Custom system prompt"),
    temperature: Optional[float] = Query(None, ge=0.0, le=1.0, description="Temperature"),
    max_tokens: Optional[int] = Query(None, ge=1, le=2048, description="Max tokens")
):
```

**Also update the function body to use `chat_request` instead of `request`:**

Find these lines in the `chat` function:
```python
response = await chat_manager.process_chat_request(request)
session_id=request.session_id,
message_length=len(request.message),
session_id=request.session_id)
```

Replace with:
```python
response = await chat_manager.process_chat_request(chat_request)
session_id=chat_request.session_id,
message_length=len(chat_request.message),
session_id=chat_request.session_id)
```

## 🚀 **Alternative: Copy Fixed File**

Or simply copy the entire fixed `app/api/v1/endpoints.py` file from this repository to your Space.

## 🎯 **Environment Variables**

Make sure these are still set in your Space:
```
MODEL_TYPE=local
MODEL_NAME=google/gemma-2b-it
DEVICE=cpu
TEMPERATURE=0.7
MAX_NEW_TOKENS=256
DEBUG=false
ENVIRONMENT=production
```

## 🧪 **Test After Fix**

Once the Space rebuilds:
```bash
curl https://sematech-sema-chat.hf.space/health
```

This should fix the rate limiter error and allow your Space to start successfully! 🚀
