import BaseMessage from './BaseMessage';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  onRetry?: () => void;
  onEdit?: () => void;
  isLoading?: boolean;
  error?: string;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export default function ChatMessage({
  content,
  isUser,
  timestamp,
  onRetry,
  onEdit,
  isLoading = false,
  error,
  metadata
}: ChatMessageProps) {
  return (
    <BaseMessage
      content={
        isLoading
          ? 'Thinking...'
          : error
            ? `Error: ${error}`
            : content
      }
      isUser={isUser}
      timestamp={timestamp}
      onEdit={isUser ? onEdit : undefined}
      onRetry={!isUser ? onRetry : undefined}
    >
      {/* Chat-specific content */}
      {!isUser && (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="loading-indicator mt-3">
              <div className="flex items-center text-xs text-[#666]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-indicator mt-3">
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                Something went wrong. Please try again.
              </div>
            </div>
          )}

          {/* Metadata */}
          {metadata && !isLoading && !error && (
            <div className="chat-metadata flex items-center gap-4 text-xs text-[#666] pt-2 border-t border-[#EFEFEF] mt-3">
              {metadata.model && (
                <span title="AI Model">
                  <strong>Model:</strong> {metadata.model}
                </span>
              )}
              {metadata.tokens && (
                <span title="Token Count">
                  <strong>Tokens:</strong> {metadata.tokens}
                </span>
              )}
              {metadata.processingTime && (
                <span title="Processing Time">
                  <strong>Time:</strong> {metadata.processingTime.toFixed(2)}s
                </span>
              )}
            </div>
          )}
        </>
      )}
    </BaseMessage>
  );
}
