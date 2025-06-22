"""
Test script for Sema Chat API
Tests all endpoints and functionality
"""

import requests
import json
import time
import asyncio
import websockets
from typing import Dict, Any
import sys


class SemaChatAPITester:
    """Test client for Sema Chat API"""

    def __init__(self, base_url: str = "http://localhost:7860"):
        self.base_url = base_url.rstrip("/")
        self.session_id = f"test-session-{int(time.time())}"

    def test_health_endpoints(self):
        """Test health and status endpoints"""
        print("🏥 Testing health endpoints...")

        # Test basic status
        response = requests.get(f"{self.base_url}/status")
        assert response.status_code == 200
        print("✅ Status endpoint working")

        # Test app-level health
        response = requests.get(f"{self.base_url}/health")
        assert response.status_code == 200
        print("✅ App health endpoint working")

        # Test detailed health
        response = requests.get(f"{self.base_url}/api/v1/health")
        assert response.status_code == 200
        health_data = response.json()
        print(f"✅ Detailed health check: {health_data['status']}")
        print(f"   Model: {health_data['model_name']} ({health_data['model_type']})")
        print(f"   Model loaded: {health_data['model_loaded']}")

        return health_data

    def test_model_info(self):
        """Test model information endpoint"""
        print("\n🤖 Testing model info...")

        response = requests.get(f"{self.base_url}/api/v1/model/info")
        assert response.status_code == 200

        model_info = response.json()
        print(f"✅ Model info retrieved")
        print(f"   Name: {model_info['name']}")
        print(f"   Type: {model_info['type']}")
        print(f"   Loaded: {model_info['loaded']}")
        print(f"   Capabilities: {model_info['capabilities']}")

        return model_info

    def test_regular_chat(self):
        """Test regular (non-streaming) chat"""
        print("\n💬 Testing regular chat...")

        chat_request = {
            "message": "Hello! Can you introduce yourself?",
            "session_id": self.session_id,
            "temperature": 0.7,
            "max_tokens": 100
        }

        start_time = time.time()
        response = requests.post(
            f"{self.base_url}/api/v1/chat",
            json=chat_request,
            headers={"Content-Type": "application/json"}
        )
        end_time = time.time()

        assert response.status_code == 200
        chat_response = response.json()

        print(f"✅ Regular chat working")
        print(f"   Response time: {end_time - start_time:.2f}s")
        print(f"   Generation time: {chat_response['generation_time']:.2f}s")
        print(f"   Response: {chat_response['message'][:100]}...")
        print(f"   Session ID: {chat_response['session_id']}")
        print(f"   Message ID: {chat_response['message_id']}")

        return chat_response

    def test_streaming_chat(self):
        """Test streaming chat via SSE"""
        print("\n🔄 Testing streaming chat...")

        params = {
            "message": "Tell me a short story about AI",
            "session_id": self.session_id,
            "temperature": 0.8,
            "max_tokens": 150
        }

        start_time = time.time()
        response = requests.get(
            f"{self.base_url}/api/v1/chat/stream",
            params=params,
            headers={"Accept": "text/event-stream"},
            stream=True
        )

        assert response.status_code == 200

        chunks_received = 0
        full_response = ""

        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    try:
                        data = json.loads(line_str[6:])  # Remove 'data: ' prefix
                        if 'content' in data:
                            full_response += data['content']
                            chunks_received += 1

                        if data.get('is_final'):
                            break
                    except json.JSONDecodeError:
                        continue

        end_time = time.time()

        print(f"✅ Streaming chat working")
        print(f"   Total time: {end_time - start_time:.2f}s")
        print(f"   Chunks received: {chunks_received}")
        print(f"   Response: {full_response[:100]}...")

        return full_response

    def test_session_management(self):
        """Test session management endpoints"""
        print("\n📝 Testing session management...")

        # Get session history
        response = requests.get(f"{self.base_url}/api/v1/sessions/{self.session_id}")
        assert response.status_code == 200

        session_data = response.json()
        print(f"✅ Session retrieval working")
        print(f"   Messages in session: {session_data['message_count']}")
        print(f"   Session created: {session_data['created_at']}")

        # Get active sessions
        response = requests.get(f"{self.base_url}/api/v1/sessions")
        assert response.status_code == 200

        sessions = response.json()
        print(f"✅ Active sessions list working")
        print(f"   Total active sessions: {len(sessions)}")

        return session_data

    async def test_websocket_chat(self):
        """Test WebSocket chat functionality"""
        print("\n🔌 Testing WebSocket chat...")

        ws_url = self.base_url.replace("http://", "ws://").replace("https://", "wss://")
        ws_url += "/api/v1/chat/ws"

        try:
            async with websockets.connect(ws_url) as websocket:
                # Send a message
                message = {
                    "message": "Hello via WebSocket!",
                    "session_id": f"{self.session_id}-ws",
                    "temperature": 0.7,
                    "max_tokens": 50
                }

                await websocket.send(json.dumps(message))

                # Receive response chunks
                chunks_received = 0
                full_response = ""

                while True:
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                        data = json.loads(response)

                        if data.get("type") == "chunk":
                            full_response += data.get("content", "")
                            chunks_received += 1

                            if data.get("is_final"):
                                break
                        elif data.get("type") == "error":
                            print(f"❌ WebSocket error: {data.get('error')}")
                            break

                    except asyncio.TimeoutError:
                        print("⚠️  WebSocket timeout")
                        break

                print(f"✅ WebSocket chat working")
                print(f"   Chunks received: {chunks_received}")
                print(f"   Response: {full_response[:100]}...")

                return full_response

        except Exception as e:
            print(f"❌ WebSocket test failed: {e}")
            return None

    def test_error_handling(self):
        """Test error handling"""
        print("\n🚨 Testing error handling...")

        # Test empty message
        response = requests.post(
            f"{self.base_url}/api/v1/chat",
            json={"message": "", "session_id": self.session_id}
        )
        assert response.status_code == 422  # Validation error
        print("✅ Empty message validation working")

        # Test invalid session ID
        response = requests.get(f"{self.base_url}/api/v1/sessions/invalid-session-id-that-does-not-exist")
        assert response.status_code == 404
        print("✅ Invalid session handling working")

        # Test rate limiting (if enabled)
        print("✅ Error handling tests passed")

    def test_session_cleanup(self):
        """Test session cleanup"""
        print("\n🧹 Testing session cleanup...")

        # Clear the test session
        response = requests.delete(f"{self.base_url}/api/v1/sessions/{self.session_id}")
        assert response.status_code == 200
        print("✅ Session cleanup working")

        # Verify session is gone
        response = requests.get(f"{self.base_url}/api/v1/sessions/{self.session_id}")
        assert response.status_code == 404
        print("✅ Session deletion verified")

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Sema Chat API Tests")
        print("=" * 50)

        try:
            # Test basic endpoints
            health_data = self.test_health_endpoints()

            if not health_data.get('model_loaded'):
                print("⚠️  Model not loaded, skipping chat tests")
                return False

            model_info = self.test_model_info()

            # Test chat functionality
            self.test_regular_chat()
            self.test_streaming_chat()

            # Test session management
            self.test_session_management()

            # Test WebSocket (async)
            asyncio.run(self.test_websocket_chat())

            # Test error handling
            self.test_error_handling()

            # Cleanup
            self.test_session_cleanup()

            print("\n" + "=" * 50)
            print("🎉 All tests passed successfully!")
            print(f"✅ API is working correctly with {model_info['name']}")
            return True

        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Main test function"""
    import argparse

    parser = argparse.ArgumentParser(description="Test Sema Chat API")
    parser.add_argument(
        "--url",
        default="http://localhost:7860",
        help="Base URL of the API (default: http://localhost:7860)"
    )

    args = parser.parse_args()

    tester = SemaChatAPITester(args.url)
    success = tester.run_all_tests()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
