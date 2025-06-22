import { useState } from 'react';
import { Copy, Volume2, RotateCcw, CheckCircle } from 'lucide-react';
import { TranslationResponse } from '../../types/translation';

interface TranslationResultProps {
  result: TranslationResponse;
  sourceText: string;
  onRetry?: () => void;
  className?: string;
}

export default function TranslationResult({
  result,
  sourceText,
  onRetry,
  className = ''
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.translated_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(result.translated_text);

      // Try to set appropriate language
      const langCode = result.target_language.split('_')[0];
      utterance.lang = langCode;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  };

  const formatConfidence = (score?: number) => {
    if (!score) return null;
    const percentage = Math.round(score * 100);
    return `${percentage}%`;
  };

  const formatProcessingTime = (time?: number) => {
    if (!time) return null;
    return `${time.toFixed(2)}s`;
  };

  return (
    <div className={`translation-result bg-white border border-[#E5E5E5] rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#EFEFEF] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-medium text-[#333]">Translation Complete</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#666]">
            {result.confidence_score && (
              <span title="Confidence Score">
                {formatConfidence(result.confidence_score)}
              </span>
            )}
            {result.processing_time && (
              <span title="Processing Time">
                {formatProcessingTime(result.processing_time)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Source Text */}
        <div>
          <div className="text-xs font-medium text-[#666] mb-2 uppercase tracking-wide">
            Source ({result.source_language})
          </div>
          <div className="p-3 bg-[#F8F9FA] rounded-md text-sm text-[#333] border border-[#EFEFEF]">
            {sourceText}
          </div>
        </div>

        {/* Translated Text */}
        <div>
          <div className="text-xs font-medium text-[#666] mb-2 uppercase tracking-wide">
            Translation ({result.target_language})
          </div>
          <div className="p-3 bg-[#F0F8FF] rounded-md text-sm text-[#333] border border-[#E0F0FF] relative">
            {result.translated_text}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-[#EFEFEF] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F8F9FA] transition-colors"
              title="Copy translation"
            >
              {copied ? (
                <>
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleSpeak}
              disabled={speaking || !('speechSynthesis' in window)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Listen to translation"
            >
              <Volume2 size={14} className={speaking ? 'animate-pulse' : ''} />
              <span>{speaking ? 'Speaking...' : 'Listen'}</span>
            </button>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#666] hover:text-[#333] transition-colors"
              title="Retry translation"
            >
              <RotateCcw size={14} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
