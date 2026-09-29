'use client';

import React from 'react';
import { DifficultyLevel } from '@/types/activity';
import { sensoryAudio } from '@/lib/audio';

interface DifficultyIndicatorProps {
  currentLevel: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
  levelLabels?: { [key in DifficultyLevel]?: string };
  disabled?: boolean;
}

export function DifficultyIndicator({
  currentLevel,
  onLevelChange,
  levelLabels = {
    1: 'Level 1: Gentle',
    2: 'Level 2: Standard',
    3: 'Level 3: Challenge'
  },
  disabled = false
}: DifficultyIndicatorProps) {
  const levels: DifficultyLevel[] = [1, 2, 3];

  const handleSelect = (level: DifficultyLevel) => {
    if (disabled || level === currentLevel) return;
    sensoryAudio.playSoftChime(440, 0.2);
    onLevelChange(level);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#F3EFE6] border border-[#E2DBD0] rounded-2xl" role="group" aria-label="Difficulty Level Selection">
      {levels.map((lvl) => {
        const isActive = lvl === currentLevel;
        return (
          <button
            key={lvl}
            type="button"
            disabled={disabled}
            onClick={() => handleSelect(lvl)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              isActive
                ? 'bg-white text-[#1C241E] shadow-xs border border-[#DCE4DD]'
                : 'text-[#48544C] hover:text-[#1C241E] hover:bg-white/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={isActive}
          >
            {levelLabels[lvl] || `Level ${lvl}`}
          </button>
        );
      })}
    </div>
  );
}
