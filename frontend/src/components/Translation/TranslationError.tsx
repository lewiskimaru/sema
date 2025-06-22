import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface TranslationErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function TranslationError({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '' 
}: TranslationErrorProps) {
  const getErrorType = (errorMessage: string) => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        title: 'Connection Error',
        suggestion: 'Please check your internet connection and try again.'
      };
    }
    
    if (message.includes('timeout')) {
      return {
        type: 'timeout',
        title: 'Request Timeout',
        suggestion: 'The request took too long. Please try again.'
      };
    }
    
    if (message.includes('empty') || message.includes('required')) {
      return {
        type: 'validation',
        title: 'Invalid Input',
        suggestion: 'Please check your input and try again.'
      };
    }
    
    if (message.includes('500') || message.includes('server')) {
      return {
        type: 'server',
        title: 'Server Error',
        suggestion: 'Our servers are experiencing issues. Please try again later.'
      };
    }
    
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        type: 'rate_limit',
        title: 'Too Many Requests',
        suggestion: 'Please wait a moment before trying again.'
      };
    }
    
    return {
      type: 'unknown',
      title: 'Translation Error',
      suggestion: 'An unexpected error occurred. Please try again.'
    };
  };

  const errorInfo = getErrorType(error);

  return (
    <div className={`translation-error bg-red-50 border border-red-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-red-200 bg-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-800">{errorInfo.title}</span>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-red-200 rounded-full transition-colors"
              title="Dismiss error"
            >
              <X size={14} className="text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="text-sm text-red-700">
          {errorInfo.suggestion}
        </div>
        
        {/* Technical Details (collapsible) */}
        <details className="text-xs text-red-600">
          <summary className="cursor-pointer hover:text-red-800 font-medium">
            Technical Details
          </summary>
          <div className="mt-2 p-2 bg-red-100 rounded border border-red-200 font-mono">
            {error}
          </div>
        </details>
      </div>

      {/* Actions */}
      {onRetry && (
        <div className="p-4 border-t border-red-200 bg-red-50">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
