'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';
import { useApp } from '@/lib/store';

interface AudioInstructionProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function AudioInstruction({ text, size = 'md', className = '', label = 'Listen' }: AudioInstructionProps) {
  const { activeChild } = useApp();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sensoryAudio.speakInstruction(text, activeChild.sensoryPreferences.voiceSpeed);
  };

  const sizeClasses = {
    sm: 'p-1.5 rounded-lg text-xs gap-1',
    md: 'p-2.5 rounded-xl text-sm gap-2',
    lg: 'p-3.5 rounded-2xl text-base gap-2.5 min-h-[56px]'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-bold bg-[#E5EDE6] text-[#2F4535] hover:bg-[#D5E5D8] active:scale-95 transition-all shadow-2xs ${sizeClasses[size]} ${className}`}
      aria-label={`Listen to instruction: ${text}`}
      title="Hear spoken instruction"
    >
      <Volume2 className={iconSizes[size]} />
      {label && <span className="font-semibold">{label}</span>}
    </button>
  );
}
