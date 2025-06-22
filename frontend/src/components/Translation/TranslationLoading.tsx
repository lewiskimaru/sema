import { Loader2, X } from 'lucide-react';

interface TranslationLoadingProps {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  onCancel?: () => void;
  className?: string;
}

export default function TranslationLoading({ 
  sourceText, 
  sourceLanguage, 
  targetLanguage, 
  onCancel, 
  className = '' 
}: TranslationLoadingProps) {
  return (
    <div className={`translation-loading bg-white border border-[#E5E5E5] rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#EFEFEF] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-[#333]">Translating...</span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
              title="Cancel translation"
            >
              <X size={14} className="text-[#666]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Source Text */}
        <div>
          <div className="text-xs font-medium text-[#666] mb-2 uppercase tracking-wide">
            Source ({sourceLanguage})
          </div>
          <div className="p-3 bg-[#F8F9FA] rounded-md text-sm text-[#333] border border-[#EFEFEF]">
            {sourceText}
          </div>
        </div>

        {/* Translation Placeholder */}
        <div>
          <div className="text-xs font-medium text-[#666] mb-2 uppercase tracking-wide">
            Translation ({targetLanguage})
          </div>
          <div className="p-3 bg-[#F0F8FF] rounded-md border border-[#E0F0FF] relative">
            <div className="space-y-2">
              {/* Animated loading bars */}
              <div className="h-4 bg-gradient-to-r from-[#E0F0FF] via-[#B8E0FF] to-[#E0F0FF] rounded animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-[#E0F0FF] via-[#B8E0FF] to-[#E0F0FF] rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-[#E0F0FF] via-[#B8E0FF] to-[#E0F0FF] rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="p-4 border-t border-[#EFEFEF] bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
          <span className="text-xs text-[#666]">Processing...</span>
        </div>
      </div>
    </div>
  );
}
