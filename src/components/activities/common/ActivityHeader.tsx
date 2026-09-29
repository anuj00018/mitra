'use client';

import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Target } from 'lucide-react';
import { DifficultyLevel } from '@/types/activity';
import { DifficultyIndicator } from './DifficultyIndicator';
import { sensoryAudio } from '@/lib/audio';
import { useApp } from '@/lib/store';

interface ActivityHeaderProps {
  title: string;
  objective: string;
  currentLevel: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
  onExit: () => void;
  levelLabels?: { [key in DifficultyLevel]?: string };
}

export function ActivityHeader({
  title,
  objective,
  currentLevel,
  onLevelChange,
  onExit,
  levelLabels
}: ActivityHeaderProps) {
  const { activeChild, updateSensoryPreferences } = useApp();
  const prefs = activeChild.sensoryPreferences;

  const toggleSound = () => {
    const nextVal = !prefs.soundEffectsEnabled;
    updateSensoryPreferences({ soundEffectsEnabled: nextVal });
    if (nextVal) sensoryAudio.playSoftChime(523.25, 0.2);
  };

  return (
    <header className="mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE4DD] text-xs sm:text-sm font-bold text-[#1C241E] hover:bg-[#F4F7F4] active:scale-95 transition-all shadow-2xs"
            aria-label="Exit activity and return to list"
          >
            <ArrowLeft className="w-4 h-4 text-[#48544C]" />
            <span>All Activities</span>
          </button>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C241E] tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Difficulty switcher & Audio quick toggle */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <DifficultyIndicator
            currentLevel={currentLevel}
            onLevelChange={onLevelChange}
            levelLabels={levelLabels}
          />

          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              prefs.soundEffectsEnabled 
                ? 'bg-white border-[#DCE4DD] text-[#4B6F55] hover:bg-[#F4F7F4]' 
                : 'bg-gray-100 border-gray-200 text-gray-400'
            }`}
            aria-label={prefs.soundEffectsEnabled ? 'Mute audio' : 'Unmute audio'}
            title={prefs.soundEffectsEnabled ? 'Audio cues enabled' : 'Audio cues muted'}
          >
            {prefs.soundEffectsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Learning Objective Banner */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F3EFE6] border border-[#E2DBD0] text-xs text-[#48544C]">
        <Target className="w-3.5 h-3.5 text-[#B8673E] shrink-0" />
        <span className="font-semibold text-[#1C241E]">Learning Goal:</span>
        <span className="truncate">{objective}</span>
      </div>
    </header>
  );
}
