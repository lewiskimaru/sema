#!/usr/bin/env python3
"""
Simple clean chat client for Sema Chat API
"""
import requests
import ast
import uuid

BASE_URL = "https://sematech-sema-chat.hf.space"
session_id = str(uuid.uuid4())[:8]

def clean_chat_stream(message):
    """Send message and get clean streaming response"""
    url = f"{BASE_URL}/api/v1/chat/stream"
    params = {"message": message, "session_id": session_id}
    headers = {"Accept": "text/event-stream"}
    
    print("🤖 AI: ", end="", flush=True)
    
    try:
        with requests.get(url, params=params, headers=headers, stream=True, timeout=60) as response:
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                return
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    
                    if line_str.startswith('data: '):
                        try:
                            # Parse the Python dictionary format
                            data_str = line_str[6:]  # Remove 'data: '
                            data = ast.literal_eval(data_str)
                            
                            if data.get('content'):
                                print(data['content'], end='', flush=True)
                            
                            if data.get('is_final'):
                                print()  # New line at end
                                return
                                
                        except (ValueError, SyntaxError):
                            # Skip malformed data
                            continue
                            
    except requests.exceptions.RequestException as e:
        print(f"\nConnection error: {e}")
    except KeyboardInterrupt:
        print("\n\nChat interrupted by user")

def main():
    print(f"🚀 Sema Chat (Session: {session_id})")
    print("Type 'quit' to exit\n")
    
    while True:
        try:
            message = input("💬 You: ")
            if message.lower().strip() in ['quit', 'exit', 'bye', 'q']:
                print("👋 Goodbye!")
                break
            
            if message.strip():  # Only send non-empty messages
                clean_chat_stream(message)
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except EOFError:
            print("\n👋 Goodbye!")
            break

if __name__ == "__main__":
    main()
