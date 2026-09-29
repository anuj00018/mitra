'use client';

import React from 'react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressIndicator({ current, total, label = 'Progress' }: ProgressIndicatorProps) {
  const percentage = Math.round((Math.min(current, total) / total) * 100);

  return (
    <div className="w-full space-y-1.5" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={label}>
      <div className="flex items-center justify-between text-xs font-bold text-[#48544C]">
        <span>{label}</span>
        <span>{current} of {total}</span>
      </div>

      <div className="w-full h-2.5 bg-[#E8E2D5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4B6F55] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
