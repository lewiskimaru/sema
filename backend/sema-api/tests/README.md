# Sema Translation API - Tests

This directory contains test scripts for the Sema Translation API.

## Test Files

### `test_model_download.py`
Tests the model downloading and loading functionality:
- Downloads models from `sematech/sema-utils` repository
- Tests model loading (SentencePiece, FastText, CTranslate2)
- Validates complete translation pipeline
- Includes cleanup functionality

**Usage:**
```bash
cd tests
python test_model_download.py
```

### `test_api_client.py`
Tests the API endpoints and functionality:
- Health check endpoints
- Translation with auto-detection
- Translation with specified source language
- Error handling validation
- Performance testing with multiple requests
- Documentation endpoint testing

**Usage:**
```bash
# Test local development server
cd tests
python test_api_client.py

# Test production server
python test_api_client.py https://sematech-sema-api.hf.space
```

## Running Tests

### Prerequisites
```bash
pip install requests huggingface_hub ctranslate2 sentencepiece fasttext-wheel
```

### Local Testing
1. Start the API server:
   ```bash
   cd backend/sema-api
   uvicorn app.main:app --reload
   ```

2. Run API tests:
   ```bash
   cd tests
   python test_api_client.py
   ```

### Production Testing
```bash
cd tests
python test_api_client.py https://sematech-sema-api.hf.space
```

## Test Coverage

### Model Tests
- ✅ Model downloading from HuggingFace Hub
- ✅ SentencePiece model loading
- ✅ FastText language detection model loading
- ✅ CTranslate2 translation model loading
- ✅ End-to-end translation pipeline

### API Tests
- ✅ Health check endpoints (`/` and `/health`)
- ✅ Translation endpoint (`/translate`)
- ✅ Auto language detection
- ✅ Manual source language specification
- ✅ Error handling (empty text, invalid requests)
- ✅ Rate limiting behavior
- ✅ Documentation endpoints (`/docs`, `/openapi.json`)
- ✅ Metrics endpoint (`/metrics`)

### Performance Tests
- ✅ Multiple concurrent requests
- ✅ Response time measurement
- ✅ Character count validation
- ✅ Request tracking with unique IDs

## Expected Results

### Model Download Test
```
🚀 Starting Sema Utils Model Test

🧪 Testing model download from sematech/sema-utils...
✅ SentencePiece model downloaded
✅ Language detection model downloaded  
✅ Translation model downloaded
✅ All models loaded successfully
🎉 Translation successful!
```

### API Client Test
```
🧪 Testing Sema Translation API

✅ Health check passed
✅ Auto-detection translation successful
✅ Specified source translation successful
✅ Empty text error handling works correctly
✅ Performance test completed
✅ OpenAPI docs accessible
🎉 All API tests passed!
```

## Troubleshooting

### Common Issues

**Model Download Fails:**
- Check internet connection
- Verify HuggingFace Hub access
- Ensure sufficient disk space

**API Tests Fail:**
- Verify API server is running
- Check correct URL/port
- Ensure all dependencies installed

**Permission Errors:**
- Check file permissions in test directory
- Ensure write access for model downloads

### Debug Mode
Add debug prints to test scripts for detailed troubleshooting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```
