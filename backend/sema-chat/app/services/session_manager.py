"""
Session Manager - Handles conversation sessions and message history
Supports both in-memory and Redis-based storage
"""

import asyncio
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
import uuid

from ..core.config import settings
from ..core.logging import LoggerMixin
from ..models.schemas import ChatMessage, ConversationHistory, SessionInfo


class SessionManager(LoggerMixin):
    """
    Manages chat sessions and conversation history
    Supports both in-memory and Redis storage backends
    """
    
    def __init__(self):
        self.sessions: Dict[str, ConversationHistory] = {}
        self.redis_client = None
        self.use_redis = bool(settings.redis_url)
        self.session_timeout = settings.session_timeout * 60  # Convert to seconds
        self.max_sessions_per_user = settings.max_sessions_per_user
        self.max_messages_per_session = settings.max_messages_per_session
        
        # Cleanup task
        self._cleanup_task = None
    
    async def initialize(self) -> bool:
        """Initialize the session manager"""
        try:
            if self.use_redis:
                await self._initialize_redis()
            
            # Start cleanup task
            self._cleanup_task = asyncio.create_task(self._cleanup_expired_sessions())
            
            self.log_info("Session manager initialized", 
                         storage_type="redis" if self.use_redis else "memory",
                         session_timeout=self.session_timeout)
            return True
            
        except Exception as e:
            self.log_error("Failed to initialize session manager", error=str(e))
            return False
    
    async def _initialize_redis(self):
        """Initialize Redis connection"""
        try:
            import redis.asyncio as redis
            self.redis_client = redis.from_url(settings.redis_url)
            
            # Test connection
            await self.redis_client.ping()
            self.log_info("Redis connection established", url=settings.redis_url)
            
        except ImportError:
            self.log_warning("Redis not available, falling back to memory storage")
            self.use_redis = False
        except Exception as e:
            self.log_error("Redis connection failed", error=str(e))
            self.use_redis = False
    
    async def shutdown(self):
        """Shutdown the session manager"""
        try:
            if self._cleanup_task:
                self._cleanup_task.cancel()
                try:
                    await self._cleanup_task
                except asyncio.CancelledError:
                    pass
            
            if self.redis_client:
                await self.redis_client.close()
            
            self.log_info("Session manager shutdown complete")
            
        except Exception as e:
            self.log_error("Session manager shutdown failed", error=str(e))
    
    async def create_session(self, session_id: str, user_id: Optional[str] = None) -> bool:
        """
        Create a new chat session
        
        Args:
            session_id: Unique session identifier
            user_id: Optional user identifier for session limits
            
        Returns:
            bool: True if session created successfully
        """
        try:
            # Check if session already exists
            if await self.session_exists(session_id):
                self.log_info("Session already exists", session_id=session_id)
                return True
            
            # Check user session limits if user_id provided
            if user_id and self.max_sessions_per_user > 0:
                user_sessions = await self.get_user_sessions(user_id)
                if len(user_sessions) >= self.max_sessions_per_user:
                    self.log_warning("User session limit exceeded", 
                                   user_id=user_id, 
                                   limit=self.max_sessions_per_user)
                    return False
            
            # Create new session
            session = ConversationHistory(
                session_id=session_id,
                messages=[],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                message_count=0
            )
            
            await self._store_session(session)
            
            self.log_info("Session created", session_id=session_id, user_id=user_id)
            return True
            
        except Exception as e:
            self.log_error("Failed to create session", error=str(e), session_id=session_id)
            return False
    
    async def add_message(self, session_id: str, message: ChatMessage) -> bool:
        """
        Add a message to a session
        
        Args:
            session_id: Session identifier
            message: Message to add
            
        Returns:
            bool: True if message added successfully
        """
        try:
            # Get or create session
            session = await self.get_session(session_id)
            if not session:
                await self.create_session(session_id)
                session = await self.get_session(session_id)
            
            if not session:
                self.log_error("Failed to create session", session_id=session_id)
                return False
            
            # Check message limit
            if (self.max_messages_per_session > 0 and 
                len(session.messages) >= self.max_messages_per_session):
                # Remove oldest messages to make room
                messages_to_remove = len(session.messages) - self.max_messages_per_session + 1
                session.messages = session.messages[messages_to_remove:]
                self.log_info("Trimmed old messages", 
                             session_id=session_id, 
                             removed_count=messages_to_remove)
            
            # Add message
            session.messages.append(message)
            session.message_count = len(session.messages)
            session.updated_at = datetime.utcnow()
            
            # Store updated session
            await self._store_session(session)
            
            self.log_debug("Message added to session", 
                          session_id=session_id, 
                          message_role=message.role,
                          total_messages=session.message_count)
            return True
            
        except Exception as e:
            self.log_error("Failed to add message", error=str(e), session_id=session_id)
            return False
    
    async def get_session(self, session_id: str) -> Optional[ConversationHistory]:
        """
        Get a session by ID
        
        Args:
            session_id: Session identifier
            
        Returns:
            ConversationHistory or None if not found
        """
        try:
            if self.use_redis:
                return await self._get_session_from_redis(session_id)
            else:
                return self.sessions.get(session_id)
                
        except Exception as e:
            self.log_error("Failed to get session", error=str(e), session_id=session_id)
            return None
    
    async def session_exists(self, session_id: str) -> bool:
        """Check if a session exists"""
        session = await self.get_session(session_id)
        return session is not None
    
    async def delete_session(self, session_id: str) -> bool:
        """
        Delete a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            bool: True if session deleted successfully
        """
        try:
            if self.use_redis:
                await self.redis_client.delete(f"session:{session_id}")
            else:
                self.sessions.pop(session_id, None)
            
            self.log_info("Session deleted", session_id=session_id)
            return True
            
        except Exception as e:
            self.log_error("Failed to delete session", error=str(e), session_id=session_id)
            return False
    
    async def get_session_messages(self, session_id: str, limit: Optional[int] = None) -> List[ChatMessage]:
        """
        Get messages from a session
        
        Args:
            session_id: Session identifier
            limit: Optional limit on number of messages to return
            
        Returns:
            List of ChatMessage objects
        """
        session = await self.get_session(session_id)
        if not session:
            return []
        
        messages = session.messages
        if limit and limit > 0:
            messages = messages[-limit:]  # Get last N messages
        
        return messages
    
    async def get_active_sessions(self) -> List[SessionInfo]:
        """Get information about all active sessions"""
        try:
            sessions = []
            
            if self.use_redis:
                # Get all session keys from Redis
                keys = await self.redis_client.keys("session:*")
                for key in keys:
                    session_id = key.decode().replace("session:", "")
                    session = await self.get_session(session_id)
                    if session:
                        sessions.append(self._session_to_info(session))
            else:
                # Get from memory
                for session in self.sessions.values():
                    sessions.append(self._session_to_info(session))
            
            return sessions
            
        except Exception as e:
            self.log_error("Failed to get active sessions", error=str(e))
            return []
    
    async def get_user_sessions(self, user_id: str) -> List[SessionInfo]:
        """Get sessions for a specific user (requires user_id in session metadata)"""
        # This is a simplified implementation
        # In a real system, you'd store user_id -> session_id mappings
        all_sessions = await self.get_active_sessions()
        return [s for s in all_sessions if s.session_id.startswith(f"{user_id}-")]
    
    def _session_to_info(self, session: ConversationHistory) -> SessionInfo:
        """Convert ConversationHistory to SessionInfo"""
        return SessionInfo(
            session_id=session.session_id,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            model_name=settings.model_name,  # Current model
            is_active=True
        )
    
    async def _store_session(self, session: ConversationHistory):
        """Store session in the appropriate backend"""
        if self.use_redis:
            await self._store_session_in_redis(session)
        else:
            self.sessions[session.session_id] = session
    
    async def _store_session_in_redis(self, session: ConversationHistory):
        """Store session in Redis"""
        key = f"session:{session.session_id}"
        data = {
            "session_id": session.session_id,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "metadata": msg.metadata or {}
                }
                for msg in session.messages
            ],
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "message_count": session.message_count
        }
        
        await self.redis_client.setex(
            key,
            self.session_timeout,
            json.dumps(data, default=str)
        )
    
    async def _get_session_from_redis(self, session_id: str) -> Optional[ConversationHistory]:
        """Get session from Redis"""
        key = f"session:{session_id}"
        data = await self.redis_client.get(key)
        
        if not data:
            return None
        
        try:
            session_data = json.loads(data)
            messages = [
                ChatMessage(
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=datetime.fromisoformat(msg["timestamp"]),
                    metadata=msg.get("metadata")
                )
                for msg in session_data["messages"]
            ]
            
            return ConversationHistory(
                session_id=session_data["session_id"],
                messages=messages,
                created_at=datetime.fromisoformat(session_data["created_at"]),
                updated_at=datetime.fromisoformat(session_data["updated_at"]),
                message_count=session_data["message_count"]
            )
            
        except Exception as e:
            self.log_error("Failed to parse session from Redis", error=str(e), session_id=session_id)
            return None
    
    async def _cleanup_expired_sessions(self):
        """Background task to cleanup expired sessions"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                if not self.use_redis:  # Redis handles expiration automatically
                    current_time = datetime.utcnow()
                    expired_sessions = []
                    
                    for session_id, session in self.sessions.items():
                        if (current_time - session.updated_at).total_seconds() > self.session_timeout:
                            expired_sessions.append(session_id)
                    
                    for session_id in expired_sessions:
                        del self.sessions[session_id]
                        self.log_debug("Expired session cleaned up", session_id=session_id)
                    
                    if expired_sessions:
                        self.log_info("Cleaned up expired sessions", count=len(expired_sessions))
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.log_error("Session cleanup failed", error=str(e))


# Global session manager instance
session_manager = SessionManager()


async def get_session_manager() -> SessionManager:
    """Get the global session manager instance"""
    return session_manager


async def initialize_session_manager() -> bool:
    """Initialize the global session manager"""
    return await session_manager.initialize()


async def shutdown_session_manager():
    """Shutdown the global session manager"""
    await session_manager.shutdown()
