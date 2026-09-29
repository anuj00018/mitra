'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title = 'Something needs a pause', message, onRetry }: ErrorAlertProps) {
  return (
    <div 
      role="alert" 
      className="p-5 rounded-2xl bg-[#FCF8F3] border border-[#B8673E]/30 flex items-start gap-4 my-4"
    >
      <div className="w-9 h-9 rounded-xl bg-[#F7EEE3] text-[#B8673E] flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#1C241E]">{title}</h4>
        <p className="text-xs sm:text-sm text-[#48544C] mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2DBD0] text-xs font-semibold text-[#1C241E] hover:bg-[#F3EFE6] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try again gently
          </button>
        )}
      </div>
    </div>
  );
}
