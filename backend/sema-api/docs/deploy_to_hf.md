# Deployment Instructions for HuggingFace Spaces

## Files Ready for Deployment

Your HuggingFace Space needs these files (all created and ready):

1. **`sema_translation_api.py`** - Main API application
2. **`requirements.txt`** - Python dependencies
3. **`Dockerfile`** - Container configuration
4. **`README.md`** - Space documentation and metadata

## Deployment Steps

### Option 1: Using Git (Recommended)

1. **Navigate to your existing HF Space repository:**
   ```bash
   cd backend/sema-api
   ```

2. **The files are ready to deploy as-is:**
   ```bash
   # All files are ready:
   # - sema_translation_api.py (main application)
   # - requirements.txt
   # - Dockerfile
   # - README.md
   ```

3. **Commit and push to HuggingFace:**
   ```bash
   git add .
   git commit -m "Update to use consolidated sema-utils models with new API"
   git push origin main
   ```

### Option 2: Using HuggingFace Web Interface

1. Go to your Space: `https://huggingface.co/spaces/sematech/sema-api`
2. Click on "Files" tab
3. Upload/replace these files:
   - Upload `sema_translation_api.py`
   - Replace `requirements.txt`
   - Replace `Dockerfile`
   - Replace `README.md`

## What Happens After Deployment

1. **Automatic Build**: HF Spaces will automatically start building your Docker container
2. **Model Download**: During build, the app will download models from `sematech/sema-utils`:
   - `spm.model` (SentencePiece tokenizer)
   - `lid218e.bin` (Language detection)
   - `translation_models/sematrans-3.3B/` (Translation model)
3. **API Startup**: Once built, your API will be available at the Space URL

## Testing Your Deployed API

### 1. Health Check
```bash
curl https://sematech-sema-api.hf.space/
```

### 2. Translation with Auto-Detection
```bash
curl -X POST "https://sematech-sema-api.hf.space/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Habari ya asubuhi",
    "target_language": "eng_Latn"
  }'
```

### 3. Translation with Source Language
```bash
curl -X POST "https://sematech-sema-api.hf.space/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Wĩ mwega?",
    "source_language": "kik_Latn",
    "target_language": "eng_Latn"
  }'
```

### 4. Interactive Documentation
Visit: `https://sematech-sema-api.hf.space/docs`

## Expected Build Time

- **First build**: 10-15 minutes (downloading models ~5GB)
- **Subsequent builds**: 2-5 minutes (models cached)

## Monitoring the Build

1. Go to your Space page
2. Click on "Logs" tab to see build progress
3. Look for these key messages:
   - "📥 Downloading models from sematech/sema-utils..."
   - "✅ All models loaded successfully!"
   - "🎉 API started successfully!"

## Troubleshooting

### If Build Fails:
1. Check the logs for specific error messages
2. Common issues:
   - Model download timeout (retry build)
   - Memory issues (models are large)
   - Network connectivity issues

### If API Doesn't Respond:
1. Check if the Space is "Running" (green status)
2. Try the health check endpoint first
3. Check logs for runtime errors

## Key Improvements in This Version

1. **Consolidated Models**: Uses your unified `sema-utils` repository
2. **Better Error Handling**: Clear error messages and validation
3. **Performance Monitoring**: Tracks inference time
4. **Clean API Design**: Follows FastAPI best practices
5. **Automatic Documentation**: Built-in OpenAPI docs
6. **Flexible Input**: Auto-detection or manual source language

## Next Steps After Deployment

1. **Test the API** with various language pairs
2. **Monitor performance** and response times
3. **Update documentation** with your actual Space URL
4. **Consider adding rate limiting** for production use
5. **Add authentication** if needed for private use

## Important Note About File Structure

The Dockerfile correctly references `sema_translation_api:app` (not `app:app`) since our main file is `sema_translation_api.py`. No need to rename files - deploy as-is!

---

Your new API is ready to deploy! 🚀
