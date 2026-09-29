'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white border border-[#E2DBD0]">
      <div className="w-16 h-16 rounded-3xl bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#1C241E] mb-2">{title}</h3>
      <p className="text-sm text-[#48544C] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#4B6F55] text-white font-semibold text-sm hover:bg-[#3D5A45] transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
