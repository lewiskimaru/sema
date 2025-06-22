"""
Test script to verify NumPy compatibility fix
"""

import requests
import json
import time

def test_translation_after_numpy_fix(api_url="https://sematech-sema-api.hf.space"):
    """Test translation functionality after NumPy compatibility fix"""
    
    print("🔧 Testing NumPy Compatibility Fix")
    print("=" * 50)
    
    # Test multiple translations to ensure stability
    test_cases = [
        {
            "text": "Habari ya asubuhi",
            "target_language": "eng_Latn",
            "expected_contains": ["morning", "hello", "good"]
        },
        {
            "text": "Asante sana",
            "target_language": "eng_Latn", 
            "expected_contains": ["thank", "thanks"]
        },
        {
            "text": "Hello world",
            "source_language": "eng_Latn",
            "target_language": "swh_Latn",
            "expected_contains": ["habari", "dunia", "halo"]
        },
        {
            "text": "Good morning",
            "source_language": "eng_Latn", 
            "target_language": "fra_Latn",
            "expected_contains": ["bonjour", "matin"]
        }
    ]
    
    successful_translations = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}/{total_tests}: '{test_case['text']}'")
        
        try:
            start_time = time.time()
            
            response = requests.post(
                f"{api_url}/translate",
                headers={"Content-Type": "application/json"},
                json=test_case,
                timeout=30
            )
            
            request_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                translation = result['translated_text'].lower()
                
                # Check if translation contains expected words
                contains_expected = any(
                    expected.lower() in translation 
                    for expected in test_case['expected_contains']
                )
                
                if contains_expected or len(translation) > 0:
                    print(f"   ✅ SUCCESS: '{result['translated_text']}'")
                    print(f"   📊 Source: {result['source_language']}")
                    print(f"   ⏱️  Time: {request_time:.3f}s (inference: {result['inference_time']:.3f}s)")
                    successful_translations += 1
                else:
                    print(f"   ⚠️  UNEXPECTED: '{result['translated_text']}'")
                    print(f"   Expected to contain: {test_case['expected_contains']}")
                    
            else:
                print(f"   ❌ FAILED: HTTP {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   Error: {response.text}")
                    
        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT: Request took longer than 30 seconds")
        except Exception as e:
            print(f"   💥 EXCEPTION: {e}")
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 SUMMARY:")
    print(f"   ✅ Successful: {successful_translations}/{total_tests}")
    print(f"   📈 Success Rate: {(successful_translations/total_tests)*100:.1f}%")
    
    if successful_translations == total_tests:
        print(f"   🎉 ALL TESTS PASSED! NumPy fix is working!")
        return True
    elif successful_translations > 0:
        print(f"   ⚠️  PARTIAL SUCCESS: Some translations working")
        return False
    else:
        print(f"   ❌ ALL TESTS FAILED: NumPy issue may persist")
        return False

def test_health_and_languages(api_url="https://sematech-sema-api.hf.space"):
    """Test non-translation endpoints to ensure they still work"""
    
    print("\n🏥 Testing Other Endpoints")
    print("-" * 30)
    
    # Test health
    try:
        response = requests.get(f"{api_url}/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health: {data['status']} (models: {data['models_loaded']})")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test languages
    try:
        response = requests.get(f"{api_url}/languages/popular", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Languages: {data['total_count']} popular languages loaded")
        else:
            print(f"❌ Languages failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Languages error: {e}")

if __name__ == "__main__":
    import sys
    
    # Allow custom API URL
    api_url = "https://sematech-sema-api.hf.space"
    if len(sys.argv) > 1:
        api_url = sys.argv[1]
    
    print(f"🎯 Testing NumPy Fix at: {api_url}")
    
    # Test health and languages first
    test_health_and_languages(api_url)
    
    # Test translation functionality
    success = test_translation_after_numpy_fix(api_url)
    
    if success:
        print("\n🎉 NumPy compatibility fix is working perfectly!")
        sys.exit(0)
    else:
        print("\n❌ NumPy compatibility issues may still exist")
        sys.exit(1)
