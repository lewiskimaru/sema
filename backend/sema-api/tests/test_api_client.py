"""
Test client for the Sema Translation API
"""

import requests
import json
import time

def test_api_endpoint(base_url="http://localhost:8000"):
    """Test the translation API endpoints"""
    
    print("🧪 Testing Sema Translation API\n")
    
    # Test 1: Health check
    print("1️⃣ Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Translation with auto-detection
    print("\n2️⃣ Testing translation with auto-detection...")
    test_data = {
        "text": "Habari ya asubuhi, ulimwengu",
        "target_language": "eng_Latn"
    }
    
    try:
        response = requests.post(
            f"{base_url}/translate",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data)
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Auto-detection translation successful:")
            print(f"   📝 Original: {test_data['text']}")
            print(f"   🔍 Detected source: {data['source_language']}")
            print(f"   🎯 Target: {data['target_language']}")
            print(f"   ✨ Translation: {data['translated_text']}")
            print(f"   ⏱️ Inference time: {data['inference_time']:.3f}s")
        else:
            print(f"❌ Auto-detection translation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Auto-detection translation error: {e}")
        return False
    
    # Test 3: Translation with specified source language
    print("\n3️⃣ Testing translation with specified source language...")
    test_data_with_source = {
        "text": "Wĩ mwega?",
        "source_language": "kik_Latn",
        "target_language": "eng_Latn"
    }
    
    try:
        response = requests.post(
            f"{base_url}/translate",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data_with_source)
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Specified source translation successful:")
            print(f"   📝 Original: {test_data_with_source['text']}")
            print(f"   🔍 Source: {data['source_language']}")
            print(f"   🎯 Target: {data['target_language']}")
            print(f"   ✨ Translation: {data['translated_text']}")
            print(f"   ⏱️ Inference time: {data['inference_time']:.3f}s")
        else:
            print(f"❌ Specified source translation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Specified source translation error: {e}")
        return False
    
    # Test 4: Error handling - empty text
    print("\n4️⃣ Testing error handling (empty text)...")
    test_data_empty = {
        "text": "",
        "target_language": "eng_Latn"
    }
    
    try:
        response = requests.post(
            f"{base_url}/translate",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data_empty)
        )
        
        if response.status_code == 400:
            print("✅ Empty text error handling works correctly")
        else:
            print(f"❌ Empty text error handling failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Empty text error handling error: {e}")
        return False
    
    # Test 5: Multiple translations for performance
    print("\n5️⃣ Testing multiple translations for performance...")
    test_texts = [
        {"text": "Jambo", "target_language": "eng_Latn"},
        {"text": "Asante sana", "target_language": "eng_Latn"},
        {"text": "Karibu", "target_language": "eng_Latn"},
        {"text": "Pole sana", "target_language": "eng_Latn"},
        {"text": "Tutaonana", "target_language": "eng_Latn"}
    ]
    
    total_time = 0
    successful_translations = 0
    
    for i, test_data in enumerate(test_texts, 1):
        try:
            start_time = time.time()
            response = requests.post(
                f"{base_url}/translate",
                headers={"Content-Type": "application/json"},
                data=json.dumps(test_data)
            )
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                request_time = end_time - start_time
                total_time += request_time
                successful_translations += 1
                
                print(f"   {i}. '{test_data['text']}' → '{data['translated_text']}' "
                      f"({request_time:.3f}s)")
            else:
                print(f"   {i}. Failed: {response.status_code}")
        except Exception as e:
            print(f"   {i}. Error: {e}")
    
    if successful_translations > 0:
        avg_time = total_time / successful_translations
        print(f"\n📊 Performance Summary:")
        print(f"   ✅ Successful translations: {successful_translations}/{len(test_texts)}")
        print(f"   ⏱️ Average request time: {avg_time:.3f}s")
        print(f"   🚀 Total time: {total_time:.3f}s")
    
    return True

def test_api_documentation(base_url="http://localhost:8000"):
    """Test API documentation endpoints"""
    
    print("\n📚 Testing API documentation...")
    
    # Test OpenAPI docs
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ OpenAPI docs accessible at /docs")
        else:
            print(f"❌ OpenAPI docs failed: {response.status_code}")
    except Exception as e:
        print(f"❌ OpenAPI docs error: {e}")
    
    # Test OpenAPI JSON
    try:
        response = requests.get(f"{base_url}/openapi.json")
        if response.status_code == 200:
            print("✅ OpenAPI JSON accessible at /openapi.json")
        else:
            print(f"❌ OpenAPI JSON failed: {response.status_code}")
    except Exception as e:
        print(f"❌ OpenAPI JSON error: {e}")

if __name__ == "__main__":
    import sys
    
    # Allow custom base URL
    base_url = "http://localhost:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print(f"🎯 Testing API at: {base_url}")
    print("⚠️  Make sure the API server is running before running this test!\n")
    
    # Run tests
    success = test_api_endpoint(base_url)
    test_api_documentation(base_url)
    
    if success:
        print("\n🎉 All API tests passed!")
    else:
        print("\n❌ Some API tests failed!")
        sys.exit(1)
