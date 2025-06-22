"""
Test script to verify the updated African languages support
"""

import requests
import json

def test_african_languages_count(api_url="https://sematech-sema-api.hf.space"):
    """Test that we now have 50+ African languages"""
    
    print("[INFO] Testing Updated African Languages Support")
    print("=" * 60)
    
    # Test African languages endpoint
    print("\n[TEST] African Languages Count")
    print("-" * 40)
    
    response = requests.get(f"{api_url}/api/v1/languages/african")
    
    if response.status_code == 200:
        data = response.json()
        african_count = data['total_count']
        
        print(f"[RESULT] Found {african_count} African languages")
        
        if african_count >= 50:
            print(f"[PASS] African language count meets FLORES-200 expectations ({african_count} >= 50)")
        else:
            print(f"[FAIL] African language count below expectations ({african_count} < 50)")
        
        # Show some examples
        print(f"\n[EXAMPLES] Sample African Languages:")
        count = 0
        for code, info in data['languages'].items():
            if count < 10:  # Show first 10
                print(f"   {code}: {info['name']} ({info['native_name']}) - {info['script']}")
                count += 1
        
        if african_count > 10:
            print(f"   ... and {african_count - 10} more languages")
            
    else:
        print(f"[FAIL] Failed to get African languages: HTTP {response.status_code}")
    
    # Test specific new languages
    print(f"\n[TEST] Specific New African Languages")
    print("-" * 40)
    
    new_languages_to_test = [
        "aka_Latn",  # Akan
        "bam_Latn",  # Bambara
        "bem_Latn",  # Bemba
        "dik_Latn",  # Dinka
        "dyu_Latn",  # Dyula
        "ewe_Latn",  # Ewe
        "fon_Latn",  # Fon
        "fuv_Latn",  # Nigerian Fulfulde
        "kab_Latn",  # Kabyle
        "kam_Latn",  # Kamba
        "kbp_Latn",  # Kabiyè
        "kea_Latn",  # Kabuverdianu
        "kin_Latn",  # Kinyarwanda
        "kmb_Latn",  # Kimbundu
        "knc_Latn",  # Central Kanuri
        "kon_Latn",  # Kikongo
        "lua_Latn",  # Luba-Lulua
        "lus_Latn",  # Mizo
        "mos_Latn",  # Mossi
        "nso_Latn",  # Northern Sotho
        "nus_Latn",  # Nuer
        "run_Latn",  # Rundi
        "sag_Latn",  # Sango
        "taq_Latn",  # Tamasheq (Latin)
        "taq_Tfng",  # Tamasheq (Tifinagh)
        "tum_Latn",  # Tumbuka
        "twi_Latn",  # Twi
        "tzm_Tfng",  # Central Atlas Tamazight
    ]
    
    found_count = 0
    missing_languages = []
    
    for lang_code in new_languages_to_test:
        response = requests.get(f"{api_url}/api/v1/languages/{lang_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[PASS] {lang_code}: {data['name']} ({data['native_name']})")
            found_count += 1
        else:
            print(f"[FAIL] {lang_code}: Not found")
            missing_languages.append(lang_code)
    
    print(f"\n[SUMMARY] New Languages Test Results:")
    print(f"   Found: {found_count}/{len(new_languages_to_test)} languages")
    print(f"   Success rate: {(found_count/len(new_languages_to_test))*100:.1f}%")
    
    if missing_languages:
        print(f"   Missing languages: {', '.join(missing_languages)}")
    
    # Test language search for African languages
    print(f"\n[TEST] African Language Search")
    print("-" * 40)
    
    search_terms = ["Akan", "Bambara", "Fulfulde", "Tamasheq", "Kanuri"]
    
    for term in search_terms:
        response = requests.get(f"{api_url}/api/v1/languages/search?q={term}")
        
        if response.status_code == 200:
            data = response.json()
            if data['total_count'] > 0:
                print(f"[PASS] Search '{term}': Found {data['total_count']} result(s)")
                for code, info in data['languages'].items():
                    print(f"   {code}: {info['name']} ({info['native_name']})")
            else:
                print(f"[FAIL] Search '{term}': No results found")
        else:
            print(f"[FAIL] Search '{term}': HTTP {response.status_code}")
    
    # Test language statistics
    print(f"\n[TEST] Updated Language Statistics")
    print("-" * 40)
    
    response = requests.get(f"{api_url}/api/v1/languages/stats")
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"[RESULT] Language Statistics:")
        print(f"   Total languages: {data['total_languages']}")
        print(f"   Total regions: {data['regions']}")
        print(f"   Total scripts: {data['scripts']}")
        
        if 'by_region' in data:
            print(f"   Languages by region:")
            for region, count in data['by_region'].items():
                print(f"     {region}: {count} languages")
                
        # Check if Africa has 50+ languages
        africa_count = data.get('by_region', {}).get('Africa', 0)
        if africa_count >= 50:
            print(f"[PASS] Africa region has {africa_count} languages (>= 50)")
        else:
            print(f"[FAIL] Africa region has only {africa_count} languages (< 50)")
            
    else:
        print(f"[FAIL] Failed to get language statistics: HTTP {response.status_code}")

def test_translation_with_new_languages(api_url="https://sematech-sema-api.hf.space"):
    """Test translation with some of the newly added African languages"""
    
    print(f"\n[TEST] Translation with New African Languages")
    print("-" * 50)
    
    # Test cases with new African languages
    test_cases = [
        {
            "text": "Hello world",
            "target_language": "aka_Latn",
            "expected_lang": "Akan"
        },
        {
            "text": "Good morning",
            "target_language": "bam_Latn", 
            "expected_lang": "Bambara"
        },
        {
            "text": "How are you?",
            "target_language": "fon_Latn",
            "expected_lang": "Fon"
        },
        {
            "text": "Thank you",
            "target_language": "twi_Latn",
            "expected_lang": "Twi"
        }
    ]
    
    successful_translations = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing translation to {test_case['expected_lang']} ({test_case['target_language']})")
        
        response = requests.post(
            f"{api_url}/api/v1/translate",
            headers={"Content-Type": "application/json"},
            json={
                "text": test_case["text"],
                "target_language": test_case["target_language"]
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Original: '{test_case['text']}'")
            print(f"   Translation: '{data['translated_text']}'")
            print(f"   Source: {data['source_language']}")
            print(f"   Target: {data['target_language']}")
            print(f"   [PASS] Translation successful")
            successful_translations += 1
        else:
            print(f"   [FAIL] Translation failed: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
    
    print(f"\n[SUMMARY] Translation Test Results:")
    print(f"   Successful: {successful_translations}/{len(test_cases)} translations")
    print(f"   Success rate: {(successful_translations/len(test_cases))*100:.1f}%")

if __name__ == "__main__":
    import sys
    
    api_url = "https://sematech-sema-api.hf.space"
    if len(sys.argv) > 1:
        api_url = sys.argv[1]
    
    print(f"[INFO] Testing updated African languages at: {api_url}")
    
    # Test African languages count and availability
    test_african_languages_count(api_url)
    
    # Test translation with new languages
    test_translation_with_new_languages(api_url)
    
    print(f"\n[SUCCESS] African languages update tests completed!")
    print(f"\nExpected results:")
    print(f"- African languages count should be 50+ (was 23)")
    print(f"- New languages like Akan, Bambara, Fon, Twi should be available")
    print(f"- Search should find new African languages")
    print(f"- Translation should work with new language codes")
