# Sema Translation API - Curl Commands

```bash
# ✅ Basic Health Check
curl https://sematech-sema-api.hf.space/health
```

```bash
# ✅ Simple Translation
curl -X POST "https://sematech-sema-api.hf.space/translate" \
     -H "Content-Type: application/json" \
     -d '{"text": "Habari ya asubuhi", "target_language": "eng_Latn"}'
```

```bash
# ✅ Get All Supported Languages
curl https://sematech-sema-api.hf.space/languages
```

```bash
# ✅ Search for a Specific Language (e.g., Swahili)
curl "https://sematech-sema-api.hf.space/languages/search?q=Swahili"
```

```bash
# ✅ Basic Translation with Auto-Detection (relative path)
curl -X POST "/translate" \
     -H "Content-Type: application/json" \
     -d '{"text": "Habari ya asubuhi", "target_language": "eng_Latn"}'
```

```bash
# ✅ Translation with Specified Source Language
curl -X POST "/translate" \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello world", "source_language": "eng_Latn", "target_language": "swh_Latn"}'
```

---
