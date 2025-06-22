"""
Utility functions and helpers
"""

import re
import uuid
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone


def generate_session_id(user_id: Optional[str] = None) -> str:
    """
    Generate a unique session ID
    
    Args:
        user_id: Optional user identifier to include in session ID
        
    Returns:
        Unique session identifier
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    random_part = str(uuid.uuid4())[:8]
    
    if user_id:
        # Create a hash of user_id for privacy
        user_hash = hashlib.md5(user_id.encode()).hexdigest()[:8]
        return f"{user_hash}-{timestamp}-{random_part}"
    else:
        return f"anon-{timestamp}-{random_part}"


def generate_message_id() -> str:
    """Generate a unique message ID"""
    return f"msg-{uuid.uuid4()}"


def sanitize_text(text: str, max_length: int = 4000) -> str:
    """
    Sanitize and clean text input
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Truncate if too long
    if len(text) > max_length:
        text = text[:max_length].rsplit(' ', 1)[0] + "..."
    
    return text


def format_timestamp(dt: datetime) -> str:
    """
    Format datetime for consistent display
    
    Args:
        dt: Datetime object
        
    Returns:
        Formatted timestamp string
    """
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")


def estimate_tokens(text: str) -> int:
    """
    Rough estimation of token count for text
    
    Args:
        text: Input text
        
    Returns:
        Estimated token count
    """
    # Very rough estimation: ~4 characters per token on average
    return max(1, len(text) // 4)


def truncate_conversation_history(
    messages: List[Dict[str, Any]], 
    max_tokens: int = 2000
) -> List[Dict[str, Any]]:
    """
    Truncate conversation history to fit within token limit
    
    Args:
        messages: List of message dictionaries
        max_tokens: Maximum token limit
        
    Returns:
        Truncated list of messages
    """
    if not messages:
        return messages
    
    # Always keep system message if present
    system_messages = [msg for msg in messages if msg.get("role") == "system"]
    other_messages = [msg for msg in messages if msg.get("role") != "system"]
    
    # Estimate tokens for system messages
    system_tokens = sum(estimate_tokens(msg.get("content", "")) for msg in system_messages)
    available_tokens = max_tokens - system_tokens
    
    if available_tokens <= 0:
        return system_messages
    
    # Add messages from the end (most recent first) until we hit the limit
    selected_messages = []
    current_tokens = 0
    
    for msg in reversed(other_messages):
        msg_tokens = estimate_tokens(msg.get("content", ""))
        if current_tokens + msg_tokens <= available_tokens:
            selected_messages.insert(0, msg)
            current_tokens += msg_tokens
        else:
            break
    
    return system_messages + selected_messages


def validate_session_id(session_id: str) -> bool:
    """
    Validate session ID format
    
    Args:
        session_id: Session identifier to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not session_id or len(session_id) < 5 or len(session_id) > 100:
        return False
    
    # Allow alphanumeric, hyphens, and underscores
    return bool(re.match(r'^[a-zA-Z0-9_-]+$', session_id))


def extract_model_name_from_path(model_path: str) -> str:
    """
    Extract clean model name from HuggingFace model path
    
    Args:
        model_path: Full model path (e.g., "microsoft/DialoGPT-medium")
        
    Returns:
        Clean model name
    """
    if "/" in model_path:
        return model_path.split("/")[-1]
    return model_path


def format_model_info(model_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format model information for API responses
    
    Args:
        model_info: Raw model information
        
    Returns:
        Formatted model information
    """
    formatted = {
        "name": model_info.get("name", "unknown"),
        "type": model_info.get("type", "unknown"),
        "loaded": model_info.get("loaded", False),
        "capabilities": model_info.get("capabilities", []),
    }
    
    # Add backend-specific information
    if "device" in model_info:
        formatted["device"] = model_info["device"]
    
    if "provider" in model_info:
        formatted["provider"] = model_info["provider"]
    
    if "parameters" in model_info:
        formatted["parameters"] = model_info["parameters"]
    
    return formatted


def create_error_response(
    error_type: str, 
    message: str, 
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create standardized error response
    
    Args:
        error_type: Type of error
        message: Error message
        details: Optional additional details
        request_id: Optional request identifier
        
    Returns:
        Formatted error response
    """
    return {
        "error": error_type,
        "message": message,
        "details": details or {},
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request_id or generate_message_id()
    }


def parse_model_backend_from_name(model_name: str) -> str:
    """
    Guess the appropriate backend type from model name
    
    Args:
        model_name: Model name or path
        
    Returns:
        Suggested backend type
    """
    model_lower = model_name.lower()
    
    if "gpt" in model_lower and ("3.5" in model_lower or "4" in model_lower):
        return "openai"
    elif "claude" in model_lower:
        return "anthropic"
    elif any(provider in model_lower for provider in ["microsoft", "google", "meta", "huggingface"]):
        return "hf_api"  # Likely available via HF API
    else:
        return "local"  # Default to local


def get_supported_model_examples() -> Dict[str, List[str]]:
    """
    Get examples of supported models for each backend type
    
    Returns:
        Dictionary mapping backend types to example models
    """
    return {
        "local": [
            "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            "microsoft/DialoGPT-medium",
            "Qwen/Qwen2.5-0.5B-Instruct",
            "microsoft/phi-2"
        ],
        "hf_api": [
            "microsoft/DialoGPT-large",
            "google/gemma-2b-it",
            "microsoft/phi-2",
            "meta-llama/Llama-2-7b-chat-hf"
        ],
        "openai": [
            "gpt-3.5-turbo",
            "gpt-4",
            "gpt-4-turbo",
            "gpt-4o"
        ],
        "anthropic": [
            "claude-3-haiku-20240307",
            "claude-3-sonnet-20240229",
            "claude-3-opus-20240229",
            "claude-3-5-sonnet-20241022"
        ]
    }


def calculate_response_metrics(
    start_time: float,
    response_text: str,
    token_count: Optional[int] = None
) -> Dict[str, Any]:
    """
    Calculate response metrics for monitoring
    
    Args:
        start_time: Request start time
        response_text: Generated response text
        token_count: Actual token count if available
        
    Returns:
        Dictionary of metrics
    """
    import time
    
    end_time = time.time()
    total_time = end_time - start_time
    
    estimated_tokens = token_count or estimate_tokens(response_text)
    tokens_per_second = estimated_tokens / total_time if total_time > 0 else 0
    
    return {
        "total_time": total_time,
        "character_count": len(response_text),
        "estimated_tokens": estimated_tokens,
        "actual_tokens": token_count,
        "tokens_per_second": tokens_per_second,
        "words_count": len(response_text.split())
    }
