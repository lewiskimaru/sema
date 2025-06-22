"""
Test script for language information endpoints
"""

import requests
import json

def test_language_endpoints(base_url="http://localhost:8000"):
    """Test all language-related endpoints"""
    
    print("🌍 Testing Language Information Endpoints\n")
    
    # Test 1: Get all languages
    print("1️⃣ Testing /languages endpoint...")
    try:
        response = requests.get(f"{base_url}/languages")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ All languages: {data['total_count']} languages found")
            print(f"   Sample: {list(data['languages'].keys())[:5]}")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Get popular languages
    print("\n2️⃣ Testing /languages/popular endpoint...")
    try:
        response = requests.get(f"{base_url}/languages/popular")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Popular languages: {data['total_count']} languages")
            for code, info in list(data['languages'].items())[:3]:
                print(f"   {code}: {info['name']} ({info['native_name']})")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 3: Get African languages
    print("\n3️⃣ Testing /languages/african endpoint...")
    try:
        response = requests.get(f"{base_url}/languages/african")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ African languages: {data['total_count']} languages")
            for code, info in list(data['languages'].items())[:3]:
                print(f"   {code}: {info['name']} ({info['native_name']})")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 4: Get languages by region
    print("\n4️⃣ Testing /languages/region/Europe endpoint...")
    try:
        response = requests.get(f"{base_url}/languages/region/Europe")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ European languages: {data['total_count']} languages")
            for code, info in list(data['languages'].items())[:3]:
                print(f"   {code}: {info['name']} ({info['native_name']})")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 5: Search languages
    print("\n5️⃣ Testing /languages/search?q=Swahili endpoint...")
    try:
        response = requests.get(f"{base_url}/languages/search?q=Swahili")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search results: {data['total_count']} languages found")
            for code, info in data['languages'].items():
                print(f"   {code}: {info['name']} ({info['native_name']})")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 6: Get language statistics
    print("\n6️⃣ Testing /languages/stats endpoint...")
    try:
        response = requests.get(f"{base_url}/languages/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Language statistics:")
            print(f"   Total languages: {data['total_languages']}")
            print(f"   Regions: {data['regions']}")
            print(f"   Scripts: {data['scripts']}")
            print(f"   By region: {data['by_region']}")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 7: Get specific language info
    print("\n7️⃣ Testing /languages/swh_Latn endpoint...")
    try:
        response = requests.get(f"{base_url}/languages/swh_Latn")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Swahili info:")
            print(f"   Name: {data['name']}")
            print(f"   Native: {data['native_name']}")
            print(f"   Region: {data['region']}")
            print(f"   Script: {data['script']}")
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 8: Test invalid language code
    print("\n8️⃣ Testing invalid language code...")
    try:
        response = requests.get(f"{base_url}/languages/invalid_code")
        if response.status_code == 404:
            print("✅ Invalid language code properly rejected")
        else:
            print(f"❌ Expected 404, got: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def test_frontend_integration_example(base_url="http://localhost:8000"):
    """Test a realistic frontend integration scenario"""
    
    print("\n🎨 Testing Frontend Integration Scenario\n")
    
    # Scenario: Building a language selector
    print("📋 Scenario: Building a language selector for a translation app")
    
    # Step 1: Get popular languages for quick selection
    print("\n1️⃣ Getting popular languages for quick selection...")
    popular_response = requests.get(f"{base_url}/languages/popular")
    popular_langs = popular_response.json()['languages']
    print(f"   Found {len(popular_langs)} popular languages")
    
    # Step 2: Get all languages for comprehensive search
    print("\n2️⃣ Getting all languages for search functionality...")
    all_response = requests.get(f"{base_url}/languages")
    all_langs = all_response.json()['languages']
    print(f"   Found {len(all_langs)} total languages")
    
    # Step 3: Validate a user's language selection
    print("\n3️⃣ Validating user's language selection (swh_Latn)...")
    validation_response = requests.get(f"{base_url}/languages/swh_Latn")
    if validation_response.status_code == 200:
        lang_info = validation_response.json()
        print(f"   ✅ Valid: {lang_info['name']} ({lang_info['native_name']})")
    
    # Step 4: Perform translation with validated languages
    print("\n4️⃣ Performing translation with validated languages...")
    translation_data = {
        "text": "Habari ya asubuhi",
        "target_language": "eng_Latn"
    }
    
    translation_response = requests.post(
        f"{base_url}/translate",
        headers={"Content-Type": "application/json"},
        data=json.dumps(translation_data)
    )
    
    if translation_response.status_code == 200:
        result = translation_response.json()
        print(f"   ✅ Translation: '{translation_data['text']}' → '{result['translated_text']}'")
        print(f"   🔍 Detected source: {result['source_language']}")
    
    print("\n🎉 Frontend integration scenario completed successfully!")

if __name__ == "__main__":
    import sys
    
    # Allow custom base URL
    base_url = "http://localhost:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print(f"🎯 Testing Language Endpoints at: {base_url}")
    print("⚠️  Make sure the API server is running!\n")
    
    # Run language endpoint tests
    success = test_language_endpoints(base_url)
    
    if success:
        # Run frontend integration test
        test_frontend_integration_example(base_url)
        print("\n🎉 All language endpoint tests passed!")
    else:
        print("\n❌ Some language endpoint tests failed!")
        sys.exit(1)
