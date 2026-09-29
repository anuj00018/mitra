'use client';

import React from 'react';
import { AudioInstruction } from './AudioInstruction';

interface InstructionPanelProps {
  instruction: string;
  hint?: string;
  className?: string;
}

export function InstructionPanel({ instruction, hint, className = '' }: InstructionPanelProps) {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#DCE4DD] shadow-xs flex items-center justify-between gap-4 ${className}`}>
      <div className="space-y-0.5">
        <p className="text-base sm:text-lg font-extrabold text-[#1C241E] leading-snug">
          {instruction}
        </p>
        {hint && (
          <p className="text-xs sm:text-sm text-[#6B786F] font-medium">
            {hint}
          </p>
        )}
      </div>

      <AudioInstruction
        text={instruction + (hint ? ` ${hint}` : '')}
        size="md"
        label="Hear"
        className="shrink-0"
      />
    </div>
  );
}
