"""
Example script to test different model backends
Demonstrates how to configure and use various model types
"""

import os
import asyncio
import sys
import time
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import Settings
from app.services.model_backends.local_hf import LocalHuggingFaceBackend
from app.services.model_backends.hf_api import HuggingFaceAPIBackend
from app.services.model_backends.openai_api import OpenAIAPIBackend
from app.services.model_backends.anthropic_api import AnthropicAPIBackend
from app.models.schemas import ChatMessage


async def test_local_hf_backend():
    """Test local HuggingFace backend"""
    print("🤖 Testing Local HuggingFace Backend")
    print("-" * 40)
    
    # Use a small model for testing
    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    
    backend = LocalHuggingFaceBackend(
        model_name=model_name,
        device="cpu",  # Use CPU for compatibility
        temperature=0.7,
        max_tokens=50
    )
    
    try:
        print(f"Loading model: {model_name}")
        success = await backend.load_model()
        
        if not success:
            print("❌ Failed to load model")
            return False
        
        print("✅ Model loaded successfully")
        
        # Test generation
        messages = [
            ChatMessage(role="user", content="Hello! What's your name?")
        ]
        
        print("Generating response...")
        start_time = time.time()
        response = await backend.generate_response(messages, max_tokens=30)
        end_time = time.time()
        
        print(f"✅ Response generated in {end_time - start_time:.2f}s")
        print(f"Response: {response.message}")
        
        # Test streaming
        print("\nTesting streaming...")
        full_response = ""
        chunk_count = 0
        
        async for chunk in backend.generate_stream(messages, max_tokens=30):
            full_response += chunk.content
            chunk_count += 1
            if chunk.is_final:
                break
        
        print(f"✅ Streaming completed with {chunk_count} chunks")
        print(f"Streamed response: {full_response}")
        
        # Cleanup
        await backend.unload_model()
        print("✅ Model unloaded")
        
        return True
        
    except Exception as e:
        print(f"❌ Local HF backend test failed: {e}")
        return False


async def test_hf_api_backend():
    """Test HuggingFace API backend"""
    print("\n🌐 Testing HuggingFace API Backend")
    print("-" * 40)
    
    # Check if API token is available
    api_token = os.getenv("HF_API_TOKEN")
    if not api_token:
        print("⚠️  HF_API_TOKEN not set, skipping HF API test")
        return True
    
    model_name = "microsoft/DialoGPT-medium"
    
    backend = HuggingFaceAPIBackend(
        model_name=model_name,
        api_token=api_token,
        temperature=0.7,
        max_tokens=50
    )
    
    try:
        print(f"Initializing API client for: {model_name}")
        success = await backend.load_model()
        
        if not success:
            print("❌ Failed to initialize API client")
            return False
        
        print("✅ API client initialized")
        
        # Test generation
        messages = [
            ChatMessage(role="user", content="Hello! How are you?")
        ]
        
        print("Generating response via API...")
        start_time = time.time()
        response = await backend.generate_response(messages, max_tokens=30)
        end_time = time.time()
        
        print(f"✅ Response generated in {end_time - start_time:.2f}s")
        print(f"Response: {response.message}")
        
        return True
        
    except Exception as e:
        print(f"❌ HF API backend test failed: {e}")
        return False


async def test_openai_backend():
    """Test OpenAI API backend"""
    print("\n🔥 Testing OpenAI API Backend")
    print("-" * 40)
    
    # Check if API key is available
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  OPENAI_API_KEY not set, skipping OpenAI test")
        return True
    
    model_name = "gpt-3.5-turbo"
    
    backend = OpenAIAPIBackend(
        model_name=model_name,
        api_key=api_key,
        temperature=0.7,
        max_tokens=50
    )
    
    try:
        print(f"Initializing OpenAI client for: {model_name}")
        success = await backend.load_model()
        
        if not success:
            print("❌ Failed to initialize OpenAI client")
            return False
        
        print("✅ OpenAI client initialized")
        
        # Test generation
        messages = [
            ChatMessage(role="user", content="Hello! What's the weather like?")
        ]
        
        print("Generating response via OpenAI...")
        start_time = time.time()
        response = await backend.generate_response(messages, max_tokens=30)
        end_time = time.time()
        
        print(f"✅ Response generated in {end_time - start_time:.2f}s")
        print(f"Response: {response.message}")
        
        # Test streaming
        print("\nTesting streaming...")
        full_response = ""
        chunk_count = 0
        
        async for chunk in backend.generate_stream(messages, max_tokens=30):
            full_response += chunk.content
            chunk_count += 1
            if chunk.is_final:
                break
        
        print(f"✅ Streaming completed with {chunk_count} chunks")
        print(f"Streamed response: {full_response}")
        
        return True
        
    except Exception as e:
        print(f"❌ OpenAI backend test failed: {e}")
        return False


async def test_anthropic_backend():
    """Test Anthropic API backend"""
    print("\n🧠 Testing Anthropic API Backend")
    print("-" * 40)
    
    # Check if API key is available
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("⚠️  ANTHROPIC_API_KEY not set, skipping Anthropic test")
        return True
    
    model_name = "claude-3-haiku-20240307"
    
    backend = AnthropicAPIBackend(
        model_name=model_name,
        api_key=api_key,
        temperature=0.7,
        max_tokens=50
    )
    
    try:
        print(f"Initializing Anthropic client for: {model_name}")
        success = await backend.load_model()
        
        if not success:
            print("❌ Failed to initialize Anthropic client")
            return False
        
        print("✅ Anthropic client initialized")
        
        # Test generation
        messages = [
            ChatMessage(role="user", content="Hello! Tell me about yourself.")
        ]
        
        print("Generating response via Anthropic...")
        start_time = time.time()
        response = await backend.generate_response(messages, max_tokens=30)
        end_time = time.time()
        
        print(f"✅ Response generated in {end_time - start_time:.2f}s")
        print(f"Response: {response.message}")
        
        return True
        
    except Exception as e:
        print(f"❌ Anthropic backend test failed: {e}")
        return False


async def main():
    """Main test function"""
    print("🚀 Sema Chat Backend Testing")
    print("=" * 50)
    
    results = {}
    
    # Test each backend
    results["local_hf"] = await test_local_hf_backend()
    results["hf_api"] = await test_hf_api_backend()
    results["openai"] = await test_openai_backend()
    results["anthropic"] = await test_anthropic_backend()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("-" * 25)
    
    for backend, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{backend:15} {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nTotal: {passed_tests}/{total_tests} backends working")
    
    if passed_tests == total_tests:
        print("🎉 All available backends are working!")
    elif passed_tests > 0:
        print("⚠️  Some backends are working, check configuration for others")
    else:
        print("❌ No backends are working, check your setup")
    
    print("\n💡 Tips:")
    print("- For HF API: Set HF_API_TOKEN environment variable")
    print("- For OpenAI: Set OPENAI_API_KEY environment variable")
    print("- For Anthropic: Set ANTHROPIC_API_KEY environment variable")
    print("- For local models: Ensure you have enough RAM/VRAM")


if __name__ == "__main__":
    asyncio.run(main())
