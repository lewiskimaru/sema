# Sema Translation API - Curl Commands

## 🌐 Base URL
```bash
# Production
API_URL="https://sematech-sema-api.hf.space"

# Local development
# API_URL="http://localhost:8000"
```

## 🏥 Health Check Endpoints

### Basic Health Check
```bash
curl -X GET "$API_URL/status"
```

### Detailed Health Check
```bash
curl -X GET "$API_URL/health"
```

### Metrics (if enabled)
```bash
curl -X GET "$API_URL/metrics"
```

## 🌍 Translation Endpoints

### Basic Translation (Auto-detect source language)
```bash
curl -X POST "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Habari ya asubuhi",
    "target_language": "eng_Latn"
  }'
```

### Translation with Specified Source Language
```bash
curl -X POST "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning",
    "source_language": "eng_Latn",
    "target_language": "swh_Latn"
  }'
```

### Translation with Versioned Endpoint
```bash
curl -X POST "$API_URL/api/v1/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Wĩ mwega?",
    "source_language": "kik_Latn",
    "target_language": "eng_Latn"
  }'
```

## � Language Detection Endpoints

### Detect Language of Text
```bash
curl -X POST "$API_URL/detect-language" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Habari ya asubuhi"
  }'
```

### Detect Language (English Text)
```bash
curl -X POST "$API_URL/detect-language" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning, how are you today?"
  }'
```

### Detect Language (French Text)
```bash
curl -X POST "$API_URL/detect-language" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjour, comment allez-vous?"
  }'
```

### Detect Language (Versioned Endpoint)
```bash
curl -X POST "$API_URL/api/v1/detect-language" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola, ¿cómo estás?"
  }'
```

## �🗣️ Language Information Endpoints

### Get All Supported Languages
```bash
curl -X GET "$API_URL/languages"
```

### Get Popular Languages
```bash
curl -X GET "$API_URL/languages/popular"
```

### Get African Languages
```bash
curl -X GET "$API_URL/languages/african"
```

### Get Languages by Region
```bash
# European languages
curl -X GET "$API_URL/languages/region/Europe"

# Asian languages
curl -X GET "$API_URL/languages/region/Asia"

# African languages
curl -X GET "$API_URL/languages/region/Africa"
```

### Search Languages
```bash
# Search for Swahili
curl -X GET "$API_URL/languages/search?q=Swahili"

# Search for Chinese
curl -X GET "$API_URL/languages/search?q=Chinese"

# Search by language code
curl -X GET "$API_URL/languages/search?q=eng"
```

### Get Language Statistics
```bash
curl -X GET "$API_URL/languages/stats"
```

### Get Specific Language Information
```bash
# Swahili
curl -X GET "$API_URL/languages/swh_Latn"

# English
curl -X GET "$API_URL/languages/eng_Latn"

# Chinese (Simplified)
curl -X GET "$API_URL/languages/cmn_Hans"
```

## 📚 Documentation Endpoints

### Swagger UI (Open in browser)
```bash
open "$API_URL/"
# or
curl -X GET "$API_URL/"
```

### ReDoc Documentation (Open in browser)
```bash
open "$API_URL/redoc"
# or
curl -X GET "$API_URL/redoc"
```

### OpenAPI JSON Schema
```bash
curl -X GET "$API_URL/openapi.json"
```

## 🧪 Test Scenarios

### Complete Translation Workflow
```bash
# 1. Check API health
echo "1. Health Check:"
curl -s "$API_URL/status" | jq '.status'

# 2. Get popular languages
echo "2. Popular Languages:"
curl -s "$API_URL/languages/popular" | jq '.total_count'

# 3. Validate language code
echo "3. Validate Swahili:"
curl -s "$API_URL/languages/swh_Latn" | jq '.name'

# 4. Perform translation
echo "4. Translation:"
curl -s -X POST "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Habari ya asubuhi", "target_language": "eng_Latn"}' \
  | jq '.translated_text'
```

### Error Testing
```bash
# Test invalid language code
curl -X GET "$API_URL/languages/invalid_code"

# Test empty translation text
curl -X POST "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "", "target_language": "eng_Latn"}'

# Test invalid search query
curl -X GET "$API_URL/languages/search?q=x"
```

## 🔧 Advanced Usage

### Pretty Print JSON Response
```bash
curl -s "$API_URL/languages/popular" | jq '.'
```

### Save Response to File
```bash
curl -s "$API_URL/languages" > all_languages.json
```

### Check Response Headers (Including Timing)
```bash
curl -I "$API_URL/health"
```

### View Response Headers with Translation
```bash
curl -v -X POST "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target_language": "swh_Latn"}'
```

### Extract Timing Headers Only
```bash
curl -s -D - -X POST "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target_language": "swh_Latn"}' \
  | grep -E "X-Response-Time|X-Request-ID"
```

### Measure Response Time
```bash
curl -w "@curl-format.txt" -s -o /dev/null "$API_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target_language": "swh_Latn"}'
```

### Multiple Translations (Batch Testing)
```bash
# Test multiple translations
for text in "Hello" "Good morning" "Thank you" "Goodbye"; do
  echo "Translating: $text"
  curl -s -X POST "$API_URL/translate" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$text\", \"target_language\": \"swh_Latn\"}" \
    | jq -r '.translated_text'
  echo "---"
done
```

## 📊 Performance Testing

### Simple Load Test
```bash
# Run 10 concurrent requests
for i in {1..10}; do
  curl -s -X POST "$API_URL/translate" \
    -H "Content-Type: application/json" \
    -d '{"text": "Hello world", "target_language": "swh_Latn"}' &
done
wait
```

### Rate Limit Testing
```bash
# Test rate limiting (should hit 60 req/min limit)
for i in {1..65}; do
  echo "Request $i:"
  curl -s -X POST "$API_URL/translate" \
    -H "Content-Type: application/json" \
    -d '{"text": "Test", "target_language": "swh_Latn"}' \
    | jq -r '.translated_text // .detail'
  sleep 0.5
done
```

## 💡 Tips

### Create curl-format.txt for timing
```bash
cat > curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

### Set API URL as environment variable
```bash
export API_URL="https://sematech-sema-api.hf.space"
# Now you can use $API_URL in all commands
```
