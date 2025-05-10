import apiClient from './apiClient'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  user_input: string
  conversation_history?: Message[]
  user_language?: string
  session_uid?: string
}

interface ChatResponse {
  message: string
  session_uid: string
  detected_language?: string
}

interface ChatSessionResponse {
  session_uid: string
  start_time: string
  last_active_time: string
  summary?: string
  messages?: Message[]
}

// Start or continue a chat session
export const sendChatMessage = async (
  userInput: string,
  sessionId?: string,
  conversationHistory?: Message[],
  userLanguage?: string
): Promise<ChatResponse> => {
  try {
    const payload: ChatRequest = {
      user_input: userInput,
    }

    // Add optional parameters if provided
    if (sessionId) {
      payload.session_uid = sessionId
    }

    if (conversationHistory && conversationHistory.length > 0) {
      payload.conversation_history = conversationHistory
    }

    if (userLanguage) {
      payload.user_language = userLanguage
    }

    const response = await apiClient.post<ChatResponse>('/chat', payload)
    return response.data
  } catch (error) {
    console.error('Chat request error:', error)
    throw error
  }
}

// Stream chat response for real-time display
export const streamChatMessage = async (
  userInput: string,
  sessionId?: string,
  conversationHistory?: Message[],
  userLanguage?: string,
  onChunk?: (chunk: string) => void
): Promise<ChatResponse> => {
  try {
    const payload: ChatRequest = {
      user_input: userInput,
    }

    // Add optional parameters if provided
    if (sessionId) {
      payload.session_uid = sessionId
    }

    if (conversationHistory && conversationHistory.length > 0) {
      payload.conversation_history = conversationHistory
    }

    if (userLanguage) {
      payload.user_language = userLanguage
    }

    // Use fetch directly for streaming support
    const response = await fetch(`${apiClient.defaults.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    // Process the stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let result: ChatResponse = {
      message: '',
      session_uid: sessionId || '',
    }

    let buffer = ''
    let completeMessage = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })
      
      // Process each line in the buffer (SSE format)
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep the last incomplete line in the buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            // End of stream
            continue
          }
          
          try {
            const parsed = JSON.parse(data)
            
            if (parsed.message) {
              completeMessage = parsed.message
              result.session_uid = parsed.session_uid
              result.detected_language = parsed.detected_language
              
              // Call the callback for each chunk if provided
              if (onChunk) {
                onChunk(parsed.message)
              }
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
    
    // Set the final complete message
    result.message = completeMessage
    
    return result
  } catch (error) {
    console.error('Chat streaming error:', error)
    throw error
  }
}

// Get chat sessions for the current user
export const getChatSessions = async (page = 1, limit = 10): Promise<ChatSessionResponse[]> => {
  try {
    const response = await apiClient.get(`/history/chat-sessions?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error)
    throw error
  }
}

// Get messages for a specific chat session
export const getChatSessionMessages = async (sessionId: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/history/chat-sessions/${sessionId}/messages`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch chat session messages:', error)
    throw error
  }
}

// Delete a chat session
export const deleteChatSession = async (sessionId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/history/chat-sessions/${sessionId}`)
    return true
  } catch (error) {
    console.error('Failed to delete chat session:', error)
    throw error
  }
}

export default {
  sendChatMessage,
  streamChatMessage,
  getChatSessions,
  getChatSessionMessages,
  deleteChatSession,
} 