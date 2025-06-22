import { ArrowRight } from 'lucide-react';
import BaseMessage from './BaseMessage';
import { TranslationResponse } from '../../types/translation';

interface TranslationMessageProps {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translation?: TranslationResponse;
  timestamp: Date;
  onRetry?: () => void;
  onEdit?: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function TranslationMessage({
  sourceText,
  sourceLanguage,
  targetLanguage,
  translation,
  timestamp,
  onRetry,
  onEdit,
  isLoading = false,
  error
}: TranslationMessageProps) {
  console.log('🎨 [TranslationMessage] Rendering with props:', {
    sourceText: sourceText.substring(0, 50) + '...',
    sourceLanguage,
    targetLanguage,
    hasTranslation: !!translation,
    translationText: translation?.translated_text?.substring(0, 50) + '...',
    isLoading,
    error
  });
  const getLanguageName = (code: string) => {
    // This should ideally come from a language service
    const languageMap: Record<string, string> = {
      'auto': 'Auto-detect',
      'eng_Latn': 'English',
      'spa_Latn': 'Spanish',
      'fra_Latn': 'French',
      'deu_Latn': 'German',
      'swh_Latn': 'Swahili',
      'cmn_Hans': 'Chinese',
      'ara_Arab': 'Arabic',
      'hin_Deva': 'Hindi',
      'rus_Cyrl': 'Russian',
      'por_Latn': 'Portuguese',
      'jpn_Jpan': 'Japanese'
    };
    return languageMap[code] || code;
  };

  const formatConfidence = (score?: number) => {
    if (!score) return null;
    const percentage = Math.round(score * 100);
    return `${percentage}%`;
  };

  return (
    <div className="translation-message-container space-y-4">
      {/* User's Translation Request */}
      <BaseMessage
        content={sourceText}
        isUser={true}
        timestamp={timestamp}
        onEdit={onEdit}
      >
        {/* Language Direction Indicator */}
        <div className="flex items-center gap-2 text-xs text-[#666] mt-2 pt-2 border-t border-[#E5E5E5]">
          <span className="font-medium">{getLanguageName(sourceLanguage)}</span>
          <ArrowRight size={12} />
          <span className="font-medium">{getLanguageName(targetLanguage)}</span>
        </div>
      </BaseMessage>

      {/* AI Translation Response */}
      {(translation || isLoading || error) && (
        <BaseMessage
          content={
            isLoading
              ? 'Translating...'
              : error
                ? `Translation failed: ${error}`
                : translation?.translated_text || ''
          }
          isUser={false}
          timestamp={timestamp}
          onRetry={onRetry}
        >
          {/* Translation Details */}
          {translation && !isLoading && !error && (
            <div className="translation-details space-y-2">
              {/* Source Language Detection */}
              {translation.source_language !== sourceLanguage && (
                <div className="text-xs text-[#666] bg-[#F0F8FF] border border-[#E0F0FF] rounded px-2 py-1">
                  <strong>Detected:</strong> {getLanguageName(translation.source_language)}
                </div>
              )}

              {/* Translation Metadata */}
              <div className="flex items-center gap-4 text-xs text-[#666] pt-2 border-t border-[#EFEFEF]">
                {translation.confidence_score && (
                  <span title="Confidence Score">
                    <strong>Confidence:</strong> {formatConfidence(translation.confidence_score)}
                  </span>
                )}
                {translation.processing_time && (
                  <span title="Processing Time">
                    <strong>Time:</strong> {translation.processing_time.toFixed(2)}s
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-indicator mt-3">
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-[#666] rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Processing translation...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-indicator mt-3">
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                Please try again or check your input.
              </div>
            </div>
          )}
        </BaseMessage>
      )}
    </div>
  );
}
