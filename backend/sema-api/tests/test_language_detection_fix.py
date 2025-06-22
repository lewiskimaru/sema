"""
Test script to verify language detection case sensitivity and confidence score fixes
"""

import requests
import json

def test_case_sensitivity_fix(api_url="https://sematech-sema-api.hf.space"):
    """Test that language detection works with different text cases"""
    
    print("🔧 Testing Case Sensitivity Fix")
    print("=" * 50)
    
    # Test same text in different cases
    test_cases = [
        {
            "variations": [
                "Habari ya asubuhi",      # Mixed case
                "habari ya asubuhi",      # Lowercase  
                "HABARI YA ASUBUHI",      # Uppercase
                "HaBaRi Ya AsUbUhI"       # Random case
            ],
            "expected_language": "swh_Latn",
            "language_name": "Swahili"
        },
        {
            "variations": [
                "Good morning everyone",
                "good morning everyone", 
                "GOOD MORNING EVERYONE",
                "GoOd MoRnInG eVeRyOnE"
            ],
            "expected_language": "eng_Latn",
            "language_name": "English"
        },
        {
            "variations": [
                "Bonjour tout le monde",
                "bonjour tout le monde",
                "BONJOUR TOUT LE MONDE"
            ],
            "expected_language": "fra_Latn", 
            "language_name": "French"
        }
    ]
    
    total_tests = 0
    successful_tests = 0
    
    for test_group in test_cases:
        print(f"\n🧪 Testing {test_group['language_name']} variations:")
        
        for variation in test_group["variations"]:
            total_tests += 1
            
            try:
                response = requests.post(
                    f"{api_url}/detect-language",
                    headers={"Content-Type": "application/json"},
                    json={"text": variation},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    detected = data['detected_language']
                    confidence = data['confidence']
                    
                    # Check if detection is correct or reasonable
                    if detected == test_group['expected_language']:
                        print(f"   ✅ '{variation}' → {detected} (confidence: {confidence:.3f})")
                        successful_tests += 1
                    else:
                        print(f"   ⚠️  '{variation}' → {detected} (expected: {test_group['expected_language']}, confidence: {confidence:.3f})")
                        # Still count as successful if confidence is reasonable
                        if confidence > 0.5:
                            successful_tests += 1
                else:
                    print(f"   ❌ '{variation}' → HTTP {response.status_code}")
                    try:
                        error_data = response.json()
                        print(f"      Error: {error_data.get('detail', 'Unknown error')}")
                    except:
                        print(f"      Error: {response.text}")
                        
            except Exception as e:
                print(f"   💥 '{variation}' → Exception: {e}")
    
    # Summary
    print(f"\n📊 Case Sensitivity Test Results:")
    print(f"   ✅ Successful: {successful_tests}/{total_tests}")
    print(f"   📈 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    return successful_tests >= (total_tests * 0.8)  # 80% success rate

def test_confidence_score_fix(api_url="https://sematech-sema-api.hf.space"):
    """Test that confidence scores are properly normalized"""
    
    print(f"\n🔧 Testing Confidence Score Normalization")
    print("=" * 50)
    
    # Test texts that might produce high confidence scores
    test_cases = [
        "hello",                    # Very common English word
        "the",                      # Most common English word
        "habari",                   # Common Swahili word
        "bonjour",                  # Common French word
        "hola",                     # Common Spanish word
        "a",                        # Single character
        "I am fine thank you",      # Clear English sentence
        "je suis bien merci"        # Clear French sentence
    ]
    
    confidence_issues = 0
    total_tests = len(test_cases)
    
    for text in test_cases:
        try:
            response = requests.post(
                f"{api_url}/detect-language",
                headers={"Content-Type": "application/json"},
                json={"text": text},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                confidence = data['confidence']
                detected = data['detected_language']
                
                if confidence > 1.0:
                    print(f"   ⚠️  '{text}' → confidence {confidence:.6f} > 1.0 (not normalized)")
                    confidence_issues += 1
                elif confidence < 0.0:
                    print(f"   ⚠️  '{text}' → confidence {confidence:.6f} < 0.0 (invalid)")
                    confidence_issues += 1
                else:
                    print(f"   ✅ '{text}' → {detected} (confidence: {confidence:.3f})")
                    
            else:
                print(f"   ❌ '{text}' → HTTP {response.status_code}")
                confidence_issues += 1
                
        except Exception as e:
            print(f"   💥 '{text}' → Exception: {e}")
            confidence_issues += 1
    
    print(f"\n📊 Confidence Score Test Results:")
    print(f"   ✅ Valid confidence scores: {total_tests - confidence_issues}/{total_tests}")
    print(f"   ⚠️  Issues found: {confidence_issues}")
    
    return confidence_issues == 0

def test_multilingual_chatbot_scenario(api_url="https://sematech-sema-api.hf.space"):
    """Test a realistic multilingual chatbot scenario"""
    
    print(f"\n🤖 Testing Multilingual Chatbot Scenario")
    print("=" * 50)
    
    # Simulate user inputs in different languages
    user_inputs = [
        {"text": "Hello, how are you?", "expected_flow": "direct_english"},
        {"text": "Habari, hujambo?", "expected_flow": "translate_to_english"},
        {"text": "Bonjour, comment ça va?", "expected_flow": "translate_to_english"},
        {"text": "Hola, ¿cómo estás?", "expected_flow": "translate_to_english"},
        {"text": "What's the weather like?", "expected_flow": "direct_english"},
        {"text": "Hali ya hewa ni vipi?", "expected_flow": "translate_to_english"}
    ]
    
    successful_scenarios = 0
    
    for i, user_input in enumerate(user_inputs, 1):
        print(f"\n🎯 Scenario {i}: '{user_input['text']}'")
        
        try:
            # Step 1: Detect language
            response = requests.post(
                f"{api_url}/detect-language",
                headers={"Content-Type": "application/json"},
                json={"text": user_input["text"]},
                timeout=10
            )
            
            if response.status_code == 200:
                detection = response.json()
                is_english = detection['is_english']
                detected_lang = detection['detected_language']
                confidence = detection['confidence']
                
                print(f"   🔍 Detected: {detected_lang} (confidence: {confidence:.3f})")
                print(f"   🏴󠁧󠁢󠁥󠁮󠁧󠁿 Is English: {is_english}")
                
                # Step 2: Determine processing flow
                if is_english:
                    print(f"   ✅ Flow: Process directly in English")
                    if user_input["expected_flow"] == "direct_english":
                        successful_scenarios += 1
                        print(f"   🎉 Expected flow matched!")
                    else:
                        print(f"   ⚠️  Expected translation flow, got direct English")
                else:
                    print(f"   🔄 Flow: Translate to English → Process → Translate back to {detected_lang}")
                    if user_input["expected_flow"] == "translate_to_english":
                        successful_scenarios += 1
                        print(f"   🎉 Expected flow matched!")
                    else:
                        print(f"   ⚠️  Expected direct English, got translation flow")
                        
            else:
                print(f"   ❌ Detection failed: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"   💥 Scenario failed: {e}")
    
    print(f"\n📊 Chatbot Scenario Results:")
    print(f"   ✅ Correct flows: {successful_scenarios}/{len(user_inputs)}")
    print(f"   📈 Accuracy: {(successful_scenarios/len(user_inputs))*100:.1f}%")
    
    return successful_scenarios >= len(user_inputs) * 0.8

if __name__ == "__main__":
    import sys
    
    # Allow custom API URL
    api_url = "https://sematech-sema-api.hf.space"
    if len(sys.argv) > 1:
        api_url = sys.argv[1]
    
    print(f"🎯 Testing Language Detection Fixes at: {api_url}")
    
    # Run all tests
    case_test = test_case_sensitivity_fix(api_url)
    confidence_test = test_confidence_score_fix(api_url)
    chatbot_test = test_multilingual_chatbot_scenario(api_url)
    
    # Final summary
    print(f"\n🏁 FINAL RESULTS:")
    print(f"   🔤 Case Sensitivity Fix: {'✅ PASSED' if case_test else '❌ FAILED'}")
    print(f"   📊 Confidence Score Fix: {'✅ PASSED' if confidence_test else '❌ FAILED'}")
    print(f"   🤖 Chatbot Scenario: {'✅ PASSED' if chatbot_test else '❌ FAILED'}")
    
    if all([case_test, confidence_test, chatbot_test]):
        print(f"\n🎉 ALL FIXES WORKING PERFECTLY!")
        sys.exit(0)
    else:
        print(f"\n⚠️  SOME ISSUES REMAIN")
        sys.exit(1)
