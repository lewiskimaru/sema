"""
Performance timing test script - demonstrates server-side timing implementation
"""

import requests
import json
import time
import statistics

def test_server_side_timing(api_url="https://sematech-sema-api.hf.space"):
    """Test server-side timing implementation"""
    
    print("[INFO] Testing Server-Side Performance Timing")
    print("=" * 60)
    
    # Test translation endpoint timing
    print("\n[TEST] Translation Endpoint Timing")
    print("-" * 40)
    
    test_cases = [
        {"text": "Hello", "target_language": "swh_Latn"},
        {"text": "Habari ya asubuhi", "target_language": "eng_Latn"},
        {"text": "Good morning everyone", "target_language": "fra_Latn"},
        {"text": "Bonjour tout le monde", "target_language": "eng_Latn"},
        {"text": "How are you doing today?", "target_language": "swh_Latn"}
    ]
    
    translation_times = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: '{test_case['text']}'")
        
        # Measure client-side time
        client_start = time.time()
        
        response = requests.post(
            f"{api_url}/translate",
            headers={"Content-Type": "application/json"},
            json=test_case,
            timeout=30
        )
        
        client_total = time.time() - client_start
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract timing information
            server_total = data.get('total_time', 0)
            inference_time = data.get('inference_time', 0)
            network_overhead = client_total - server_total
            processing_overhead = server_total - inference_time
            
            # Extract response headers
            response_time_header = response.headers.get('X-Response-Time', 'N/A')
            response_time_ms = response.headers.get('X-Response-Time-Ms', 'N/A')
            request_id = response.headers.get('X-Request-ID', 'N/A')
            
            print(f"   Translation: '{data['translated_text']}'")
            print(f"   [TIMING] Client total: {client_total:.3f}s")
            print(f"   [TIMING] Server total: {server_total:.3f}s")
            print(f"   [TIMING] Model inference: {inference_time:.3f}s")
            print(f"   [TIMING] Processing overhead: {processing_overhead:.3f}s")
            print(f"   [TIMING] Network overhead: {network_overhead:.3f}s")
            print(f"   [HEADERS] X-Response-Time: {response_time_header}")
            print(f"   [HEADERS] X-Response-Time-Ms: {response_time_ms}")
            print(f"   [HEADERS] X-Request-ID: {request_id}")
            
            translation_times.append({
                'client_total': client_total,
                'server_total': server_total,
                'inference_time': inference_time,
                'processing_overhead': processing_overhead,
                'network_overhead': network_overhead
            })
            
        else:
            print(f"   [FAIL] HTTP {response.status_code}")
    
    # Test language detection timing
    print(f"\n[TEST] Language Detection Timing")
    print("-" * 40)
    
    detection_cases = [
        "Hello world",
        "Habari ya dunia", 
        "Bonjour le monde",
        "Hola mundo",
        "Good morning everyone, how are you doing today?"
    ]
    
    detection_times = []
    
    for i, text in enumerate(detection_cases, 1):
        print(f"\n{i}. Detecting: '{text}'")
        
        client_start = time.time()
        
        response = requests.post(
            f"{api_url}/detect-language",
            headers={"Content-Type": "application/json"},
            json={"text": text},
            timeout=10
        )
        
        client_total = time.time() - client_start
        
        if response.status_code == 200:
            data = response.json()
            
            server_total = data.get('total_time', 0)
            network_overhead = client_total - server_total
            
            response_time_header = response.headers.get('X-Response-Time', 'N/A')
            
            print(f"   Detected: {data['detected_language']} ({data['language_name']})")
            print(f"   Confidence: {data['confidence']:.3f}")
            print(f"   [TIMING] Client total: {client_total:.3f}s")
            print(f"   [TIMING] Server total: {server_total:.3f}s")
            print(f"   [TIMING] Network overhead: {network_overhead:.3f}s")
            print(f"   [HEADERS] X-Response-Time: {response_time_header}")
            
            detection_times.append({
                'client_total': client_total,
                'server_total': server_total,
                'network_overhead': network_overhead
            })
            
        else:
            print(f"   [FAIL] HTTP {response.status_code}")
    
    # Performance summary
    print(f"\n[SUMMARY] Performance Analysis")
    print("=" * 60)
    
    if translation_times:
        print(f"\nTranslation Performance:")
        avg_client = statistics.mean([t['client_total'] for t in translation_times])
        avg_server = statistics.mean([t['server_total'] for t in translation_times])
        avg_inference = statistics.mean([t['inference_time'] for t in translation_times])
        avg_processing = statistics.mean([t['processing_overhead'] for t in translation_times])
        avg_network = statistics.mean([t['network_overhead'] for t in translation_times])
        
        print(f"   Average client total: {avg_client:.3f}s")
        print(f"   Average server total: {avg_server:.3f}s")
        print(f"   Average inference: {avg_inference:.3f}s")
        print(f"   Average processing overhead: {avg_processing:.3f}s")
        print(f"   Average network overhead: {avg_network:.3f}s")
        print(f"   Efficiency: {(avg_inference/avg_server)*100:.1f}% (inference/server)")
    
    if detection_times:
        print(f"\nLanguage Detection Performance:")
        avg_client = statistics.mean([t['client_total'] for t in detection_times])
        avg_server = statistics.mean([t['server_total'] for t in detection_times])
        avg_network = statistics.mean([t['network_overhead'] for t in detection_times])
        
        print(f"   Average client total: {avg_client:.3f}s")
        print(f"   Average server total: {avg_server:.3f}s")
        print(f"   Average network overhead: {avg_network:.3f}s")
    
    print(f"\n[INFO] Server-side timing provides:")
    print(f"   - Accurate server processing time")
    print(f"   - Network overhead calculation")
    print(f"   - Performance bottleneck identification")
    print(f"   - Response headers for monitoring")
    print(f"   - Request tracking with unique IDs")

def test_concurrent_performance(api_url="https://sematech-sema-api.hf.space", num_requests=5):
    """Test concurrent request performance"""
    
    print(f"\n[TEST] Concurrent Performance ({num_requests} requests)")
    print("-" * 50)
    
    import threading
    import queue
    
    results = queue.Queue()
    
    def make_request(request_id):
        start_time = time.time()
        try:
            response = requests.post(
                f"{api_url}/translate",
                headers={"Content-Type": "application/json"},
                json={"text": f"Hello world {request_id}", "target_language": "swh_Latn"},
                timeout=30
            )
            
            client_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                server_time = data.get('total_time', 0)
                inference_time = data.get('inference_time', 0)
                
                results.put({
                    'request_id': request_id,
                    'success': True,
                    'client_time': client_time,
                    'server_time': server_time,
                    'inference_time': inference_time,
                    'translation': data['translated_text']
                })
            else:
                results.put({
                    'request_id': request_id,
                    'success': False,
                    'error': response.status_code
                })
                
        except Exception as e:
            results.put({
                'request_id': request_id,
                'success': False,
                'error': str(e)
            })
    
    # Start concurrent requests
    threads = []
    start_time = time.time()
    
    for i in range(num_requests):
        thread = threading.Thread(target=make_request, args=(i+1,))
        threads.append(thread)
        thread.start()
    
    # Wait for all requests to complete
    for thread in threads:
        thread.join()
    
    total_time = time.time() - start_time
    
    # Collect results
    successful_requests = []
    failed_requests = []
    
    while not results.empty():
        result = results.get()
        if result['success']:
            successful_requests.append(result)
        else:
            failed_requests.append(result)
    
    print(f"   Total time for {num_requests} concurrent requests: {total_time:.3f}s")
    print(f"   Successful requests: {len(successful_requests)}")
    print(f"   Failed requests: {len(failed_requests)}")
    
    if successful_requests:
        avg_client = statistics.mean([r['client_time'] for r in successful_requests])
        avg_server = statistics.mean([r['server_time'] for r in successful_requests])
        avg_inference = statistics.mean([r['inference_time'] for r in successful_requests])
        
        print(f"   Average client time: {avg_client:.3f}s")
        print(f"   Average server time: {avg_server:.3f}s")
        print(f"   Average inference time: {avg_inference:.3f}s")
        print(f"   Requests per second: {len(successful_requests)/total_time:.2f}")

if __name__ == "__main__":
    import sys
    
    api_url = "https://sematech-sema-api.hf.space"
    if len(sys.argv) > 1:
        api_url = sys.argv[1]
    
    print(f"[INFO] Testing performance timing at: {api_url}")
    
    # Test server-side timing
    test_server_side_timing(api_url)
    
    # Test concurrent performance
    test_concurrent_performance(api_url)
    
    print(f"\n[SUCCESS] Performance timing tests completed!")
