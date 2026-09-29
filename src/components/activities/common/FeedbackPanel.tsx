'use client';

import React from 'react';
import { CheckCircle2, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface FeedbackPanelProps {
  status: 'correct' | 'incorrect' | 'neutral';
  message: string;
  onNext?: () => void;
  onRetry?: () => void;
  nextLabel?: string;
  showAction?: boolean;
}

export function FeedbackPanel({
  status,
  message,
  onNext,
  onRetry,
  nextLabel = 'Continue',
  showAction = true
}: FeedbackPanelProps) {
  if (status === 'neutral') return null;

  const isSuccess = status === 'correct';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isSuccess
          ? 'bg-[#E5EDE6] border-[#4B6F55] text-[#1C241E]'
          : 'bg-[#FCF8F3] border-[#B8673E] text-[#1C241E]'
      }`}
    >
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess ? 'bg-[#4B6F55] text-white' : 'bg-[#B8673E] text-white'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-sm font-bold">
            {isSuccess ? 'Well Done!' : 'Take Another Look'}
          </h4>
          <p className="text-xs sm:text-sm text-[#48544C] mt-0.5">
            {message}
          </p>
        </div>
      </div>

      {showAction && (
        <div className="flex items-center gap-2 shrink-0">
          {!isSuccess && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E2DBD0] text-xs font-bold text-[#1C241E] hover:bg-[#F3EFE6] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}

          {isSuccess && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4B6F55] text-white text-xs sm:text-sm font-bold hover:bg-[#3D5A45] shadow-xs transition-colors"
            >
              <span>{nextLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
