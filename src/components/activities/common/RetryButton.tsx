'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';

interface RetryButtonProps {
  onRetry: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RetryButton({
  onRetry,
  label = 'Reset Activity',
  size = 'md',
  className = ''
}: RetryButtonProps) {
  const handleClick = () => {
    sensoryAudio.playCalmTick();
    onRetry();
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5 min-h-[52px]'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-bold bg-[#F3EFE6] text-[#48544C] hover:bg-[#E8E2D5] hover:text-[#1C241E] border border-[#E2DBD0] active:scale-95 transition-all shadow-2xs ${sizeClasses[size]} ${className}`}
      aria-label={label}
    >
      <RotateCcw className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
