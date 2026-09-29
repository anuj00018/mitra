'use client';

import React, { useEffect } from 'react';
import { Award, Clock, Target, RotateCcw, ArrowRight, Home } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';
import { useApp } from '@/lib/store';
import { ActivityId, DifficultyLevel } from '@/types/activity';

interface CompletionScreenProps {
  activityId: ActivityId;
  title: string;
  difficulty: DifficultyLevel;
  durationSeconds: number;
  attempts: number;
  errors: number;
  score: number;
  accuracyRate: number;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onExit: () => void;
}

export function CompletionScreen({
  activityId,
  title,
  difficulty,
  durationSeconds,
  attempts,
  errors,
  score,
  accuracyRate,
  onPlayAgain,
  onNextLevel,
  onExit
}: CompletionScreenProps) {
  const { activeChild, logSession } = useApp();

  useEffect(() => {
    sensoryAudio.playSuccessTone();
    sensoryAudio.speakInstruction(
      `Wonderful work, ${activeChild.displayName}! You finished ${title}.`,
      activeChild.sensoryPreferences.voiceSpeed
    );

    // Save structured result to store
    logSession({
      childId: activeChild.id,
      activityId,
      activityTitle: title,
      durationSeconds,
      completed: true,
      promptsNeeded: errors,
      accuracyRate,
      sensoryFatigueFlag: false,
      childMood: accuracyRate >= 0.85 ? 'happy' : 'calm'
    });

    // Also attempt async sync to FastAPI backend if available
    fetch('http://localhost:8000/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: activeChild.id,
        activity_id: activityId,
        duration_seconds: durationSeconds,
        completed: true,
        prompts_needed: errors,
        accuracy_rate: accuracyRate,
        sensory_fatigue_flag: false,
        child_mood_entry: accuracyRate >= 0.85 ? 'happy' : 'calm'
      })
    }).catch(() => {
      // Offline / standalone mode: store handles local persistence
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s} seconds`;
  };

  const accuracyPercent = Math.round(accuracyRate * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center space-y-6 animate-fade-in">
      
      {/* Calm Success Icon */}
      <div className="w-24 h-24 mx-auto rounded-3xl bg-[#E5EDE6] text-[#2F4535] border-2 border-[#C7D9CA] flex items-center justify-center shadow-xs">
        <Award className="w-12 h-12 text-[#4B6F55]" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4B6F55] px-3 py-1 rounded-full bg-[#E5EDE6]">
          Activity Finished • Level {difficulty}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C241E]">
          Wonderful Job, {activeChild.displayName}!
        </h2>
        <p className="text-sm sm:text-base text-[#48544C] max-w-md mx-auto">
          You completed all tasks in <span className="font-bold text-[#1C241E]">{title}</span> with steady focus.
        </p>
      </div>

      {/* Structured Stats Grid */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-4 rounded-2xl bg-white border border-[#E2DBD0] shadow-2xs">
        <div className="text-center">
          <div className="flex items-center justify-center text-[#4B6F55] mb-1">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1C241E]">{accuracyPercent}%</p>
          <span className="text-[11px] text-[#6B786F] font-bold">Accuracy</span>
        </div>

        <div className="text-center border-x border-[#E8E2D5]">
          <div className="flex items-center justify-center text-[#B8673E] mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1C241E]">{formatMinutes(durationSeconds)}</p>
          <span className="text-[11px] text-[#6B786F] font-bold">Time Spent</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center text-[#3C6C82] mb-1">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#1C241E]">{score}/100</p>
          <span className="text-[11px] text-[#6B786F] font-bold">Score</span>
        </div>
      </div>

      <p className="text-xs text-[#6B786F] font-semibold">
        Logged {attempts} action attempts • {errors} gentle prompt cues
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {difficulty < 3 && onNextLevel && (
          <button
            type="button"
            onClick={onNextLevel}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#4B6F55] hover:bg-[#3D5A45] text-white font-extrabold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>Try Level {difficulty + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-[#DCE4DD] hover:bg-[#F4F7F4] text-[#1C241E] font-bold text-sm transition-all shadow-2xs flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-[#6B786F]" />
          <span>Play Again</span>
        </button>

        <button
          type="button"
          onClick={onExit}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#F3EFE6] hover:bg-[#E8E2D5] text-[#48544C] font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>All Activities</span>
        </button>
      </div>

    </div>
  );
}
