#!/usr/bin/env python3
import requests
import json
import uuid
import ast

session_id = str(uuid.uuid4())[:8]
print(f"🚀 Sema Chat (Session: {session_id})")
print("Type 'quit' to exit\n")

def test_non_streaming_first():
    """Test non-streaming chat first"""
    print("🧪 Testing non-streaming chat...")
    url = "https://sematech-sema-chat.hf.space/api/v1/chat"
    data = {"message": "Hello, who are you?", "session_id": session_id}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Non-streaming works: {result.get('message', 'No message')[:100]}...")
            return True
        else:
            print(f"❌ Non-streaming failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Non-streaming error: {e}")
        return False

def chat_streaming(message):
    """Enhanced streaming chat with debug info"""
    print("🤖 AI: ", end="", flush=True)

    url = "https://sematech-sema-chat.hf.space/api/v1/chat/stream"
    params = {"message": message, "session_id": session_id}
    headers = {"Accept": "text/event-stream"}

    try:
        with requests.get(url, params=params, headers=headers, stream=True, timeout=60) as r:
            print(f"[DEBUG: Status {r.status_code}]", end="", flush=True)

            if r.status_code != 200:
                print(f"\n❌ Error: {r.status_code} - {r.text}")
                return

            content_received = False
            line_count = 0

            for line in r.iter_lines():
                line_count += 1
                if line:
                    line_str = line.decode('utf-8')
                    print(f"[DEBUG: Line {line_count}: {line_str[:50]}...]", end="", flush=True)

                    if line_str.startswith('data: '):
                        try:
                            data_str = line_str[6:]  # Remove 'data: '
                            # Parse Python dictionary format safely
                            data = ast.literal_eval(data_str)

                            if data.get('content'):
                                content_received = True
                                print(data['content'], end='', flush=True)

                            if data.get('is_final'):
                                print("\n")
                                return

                        except json.JSONDecodeError as e:
                            print(f"[JSON Error: {e}]", end="", flush=True)

                    elif line_str.startswith('event: '):
                        print(f"[Event: {line_str[7:]}]", end="", flush=True)

                # Timeout check
                if line_count > 1000:  # Prevent infinite loops
                    print("\n⚠️ Too many lines, stopping...")
                    break

            if not content_received:
                print("\n❌ No content received from stream")

    except requests.exceptions.Timeout:
        print("\n⏰ Request timed out")
    except Exception as e:
        print(f"\n❌ Streaming error: {e}")

# Test non-streaming first
if test_non_streaming_first():
    print("\n" + "="*50)
    print("Now testing streaming chat...")
    print("="*50 + "\n")

    while True:
        message = input("💬 You: ")
        if message.lower() in ['quit', 'exit', 'bye']:
            break

        chat_streaming(message)
else:
    print("❌ Non-streaming chat failed, check your API configuration")