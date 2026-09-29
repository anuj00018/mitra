'use client';

import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  label?: string;
}

export function LoadingSkeleton({ lines = 3, className = '', label = 'Loading calm content...' }: LoadingSkeletonProps) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className={`p-6 rounded-3xl bg-white border border-[#E2DBD0] space-y-4 ${className}`}
    >
      <span className="sr-only">{label}</span>
      <div className="h-6 w-1/3 bg-[#E8E2D5] rounded-xl animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className="h-4 bg-[#F3EFE6] rounded-lg animate-pulse"
            style={{ width: `${90 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}
