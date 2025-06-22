"""
Simple API test script using requests with performance tracking
"""

import requests
import json
import time

# API base URL - change this to test different environments
API_URL = "https://sematech-sema-api.hf.space"
# API_URL = "http://localhost:8000"  # For local testing

def test_health():
    """Test basic health check"""
    print("[TEST] Health check...")

    start_time = time.time()
    response = requests.get(f"{API_URL}/status")
    response_time = time.time() - start_time

    print(f"Status: {response.status_code}")
    print(f"Response time: {response_time:.3f}s")

    if response.status_code == 200:
        data = response.json()
        print(f"[PASS] API is healthy")
        print(f"Version: {data['version']}")
        print(f"Models loaded: {data['models_loaded']}")
    else:
        print(f"[FAIL] Health check failed")

    print("-" * 50)

def test_translation():
    """Test basic translation"""
    print("[TEST] Translation...")

    # Test data
    data = {
        "text": "Habari ya asubuhi",
        "target_language": "eng_Latn"
    }

    start_time = time.time()
    response = requests.post(
        f"{API_URL}/translate",
        headers={"Content-Type": "application/json"},
        json=data
    )
    response_time = time.time() - start_time

    print(f"Status: {response.status_code}")
    print(f"Response time: {response_time:.3f}s")

    if response.status_code == 200:
        result = response.json()
        print(f"[PASS] Translation successful")
        print(f"Original: {data['text']}")
        print(f"Translation: {result['translated_text']}")
        print(f"Source language: {result['source_language']}")
        print(f"Model inference time: {result['inference_time']:.3f}s")
        print(f"Total request time: {response_time:.3f}s")
        print(f"Network overhead: {(response_time - result['inference_time']):.3f}s")
    else:
        print(f"[FAIL] Translation failed")
        print(f"Status code: {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error details: {error_data}")
        except:
            print(f"Error text: {response.text}")

    print("-" * 50)

def test_languages():
    """Test language endpoints"""
    print("[TEST] Language endpoints...")

    # Test all languages
    start_time = time.time()
    response = requests.get(f"{API_URL}/languages")
    response_time = time.time() - start_time
    if response.status_code == 200:
        data = response.json()
        print(f"[PASS] Found {data['total_count']} supported languages ({response_time:.3f}s)")
    else:
        print(f"[FAIL] Failed to get languages ({response_time:.3f}s)")

    # Test popular languages
    start_time = time.time()
    response = requests.get(f"{API_URL}/languages/popular")
    response_time = time.time() - start_time
    if response.status_code == 200:
        data = response.json()
        print(f"[PASS] Found {data['total_count']} popular languages ({response_time:.3f}s)")
    else:
        print(f"[FAIL] Failed to get popular languages ({response_time:.3f}s)")

    # Test specific language
    start_time = time.time()
    response = requests.get(f"{API_URL}/languages/swh_Latn")
    response_time = time.time() - start_time
    if response.status_code == 200:
        data = response.json()
        print(f"[PASS] Swahili info: {data['name']} ({data['native_name']}) ({response_time:.3f}s)")
    else:
        print(f"[FAIL] Failed to get Swahili info ({response_time:.3f}s)")

    print("-" * 50)

def test_search():
    """Test language search"""
    print("[TEST] Language search...")

    response = requests.get(f"{API_URL}/languages/search?q=Swahili")

    if response.status_code == 200:
        data = response.json()
        print(f"[PASS] Search found {data['total_count']} results")
        for code, info in data['languages'].items():
            print(f"  {code}: {info['name']} ({info['native_name']})")
    else:
        print(f"[FAIL] Search failed")

    print("-" * 50)

def test_language_detection():
    """Test language detection endpoint"""
    print("[TEST] Language detection...")

    test_cases = [
        {"text": "Habari ya asubuhi", "expected_lang": "swh_Latn", "description": "Swahili (mixed case)"},
        {"text": "habari ya asubuhi", "expected_lang": "swh_Latn", "description": "Swahili (lowercase)"},
        {"text": "Good morning", "expected_lang": "eng_Latn", "description": "English (mixed case)"},
        {"text": "good morning", "expected_lang": "eng_Latn", "description": "English (lowercase)"},
        {"text": "Bonjour", "expected_lang": "fra_Latn", "description": "French"},
        {"text": "Hola mundo", "expected_lang": "spa_Latn", "description": "Spanish"},
        {"text": "HELLO WORLD", "expected_lang": "eng_Latn", "description": "English (uppercase)"}
    ]

    for test_case in test_cases:
        response = requests.post(
            f"{API_URL}/detect-language",
            headers={"Content-Type": "application/json"},
            json={"text": test_case["text"]}
        )

        if response.status_code == 200:
            data = response.json()
            detected = data['detected_language']
            confidence = data['confidence']
            is_english = data['is_english']

            print(f"[PASS] '{test_case['text']}' -> {detected} ({data['language_name']})")
            print(f"   {test_case['description']}, Confidence: {confidence:.3f}, Is English: {is_english}")
        else:
            print(f"[FAIL] Detection failed for '{test_case['text']}' ({test_case['description']})")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")

    print("-" * 50)

def run_all_tests():
    """Run all tests"""
    print(f"[INFO] Testing API at: {API_URL}")
    print("=" * 50)

    test_health()
    test_translation()
    test_languages()
    test_search()
    test_language_detection()

    print("[INFO] All tests completed!")

if __name__ == "__main__":
    run_all_tests()
