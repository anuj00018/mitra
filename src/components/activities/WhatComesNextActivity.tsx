'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Apple, Banana, Circle, Square, Triangle, Star, Moon } from 'lucide-react';

interface PatternItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

interface PatternRound {
  sequence: PatternItem[];
  missingItem: PatternItem;
  options: PatternItem[];
  hint: string;
}

const ITEMS: { [key: string]: PatternItem } = {
  apple: { id: 'apple', name: 'Apple', icon: Apple, colorClass: 'text-[#B8673E]' },
  banana: { id: 'banana', name: 'Banana', icon: Banana, colorClass: 'text-[#C7983E]' },
  circle: { id: 'circle', name: 'Green Circle', icon: Circle, colorClass: 'text-[#4B6F55] fill-[#E5EDE6]' },
  square: { id: 'square', name: 'Blue Square', icon: Square, colorClass: 'text-[#3C6C82] fill-[#E1EEF5]' },
  triangle: { id: 'triangle', name: 'Amber Triangle', icon: Triangle, colorClass: 'text-[#B8673E] fill-[#F7EEE3]' },
  star: { id: 'star', name: 'Golden Star', icon: Star, colorClass: 'text-[#B8673E] fill-[#FCF8F3]' },
  moon: { id: 'moon', name: 'Crescent Moon', icon: Moon, colorClass: 'text-[#3C6C82]' }
};

const PATTERN_ROUNDS: { [key in DifficultyLevel]: PatternRound[] } = {
  1: [
    // AB-AB pattern
    {
      sequence: [ITEMS.apple, ITEMS.banana, ITEMS.apple, ITEMS.banana],
      missingItem: ITEMS.apple,
      options: [ITEMS.apple, ITEMS.banana, ITEMS.star],
      hint: 'Notice the rhythm: Apple, Banana, Apple, Banana...'
    },
    {
      sequence: [ITEMS.circle, ITEMS.square, ITEMS.circle, ITEMS.square],
      missingItem: ITEMS.circle,
      options: [ITEMS.square, ITEMS.circle, ITEMS.triangle],
      hint: 'Circle, Square, Circle, Square...'
    }
  ],
  2: [
    // ABC-ABC pattern
    {
      sequence: [ITEMS.circle, ITEMS.square, ITEMS.triangle, ITEMS.circle, ITEMS.square],
      missingItem: ITEMS.triangle,
      options: [ITEMS.triangle, ITEMS.circle, ITEMS.square],
      hint: 'Three repeating items: Circle, Square, Triangle...'
    },
    {
      sequence: [ITEMS.apple, ITEMS.banana, ITEMS.star, ITEMS.apple, ITEMS.banana],
      missingItem: ITEMS.star,
      options: [ITEMS.banana, ITEMS.star, ITEMS.apple],
      hint: 'Apple, Banana, Star, Apple, Banana...'
    }
  ],
  3: [
    // AAB-AAB pattern
    {
      sequence: [ITEMS.star, ITEMS.star, ITEMS.moon, ITEMS.star, ITEMS.star],
      missingItem: ITEMS.moon,
      options: [ITEMS.star, ITEMS.moon, ITEMS.circle],
      hint: 'Two stars, one moon; two stars...'
    },
    {
      sequence: [ITEMS.circle, ITEMS.circle, ITEMS.triangle, ITEMS.circle, ITEMS.circle],
      missingItem: ITEMS.triangle,
      options: [ITEMS.triangle, ITEMS.circle, ITEMS.square],
      hint: 'Double circle, single triangle...'
    }
  ]
};

export function WhatComesNextActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [roundIdx, setRoundIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  const rounds = PATTERN_ROUNDS[level];
  const currentRound = rounds[roundIdx];

  const resetActivity = () => {
    setRoundIdx(0);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleSelectOption = (option: PatternItem) => {
    setAttempts(a => a + 1);

    if (option.id === currentRound.missingItem.id) {
      sensoryAudio.playSuccessTone();
      setFeedback({
        status: 'correct',
        msg: `That's it! ${option.name} completes the pattern.`
      });

      setTimeout(() => {
        if (roundIdx + 1 < rounds.length) {
          setRoundIdx(r => r + 1);
          setFeedback({ status: 'neutral', msg: '' });
        } else {
          setIsCompleted(true);
        }
      }, 1000);
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: currentRound.hint
      });
    }
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (rounds.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="what-comes-next"
        title="What Comes Next?"
        difficulty={level}
        durationSeconds={duration}
        attempts={attempts}
        errors={errors}
        score={score}
        accuracyRate={accuracy}
        onPlayAgain={() => resetActivity()}
        onNextLevel={level < 3 ? () => { const nextLvl = (level + 1) as DifficultyLevel; setLevel(nextLvl); resetActivity(); } : undefined}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="What Comes Next?"
        objective="Strengthen predictive sequencing and deductive logic through pattern completion."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: AB Pattern',
          2: 'Level 2: ABC Pattern',
          3: 'Level 3: AAB Pattern'
        }}
      />

      <InstructionPanel
        instruction="Look at the repeating pattern and choose what comes next."
        hint={currentRound.hint}
      />

      <ProgressIndicator
        current={roundIdx + 1}
        total={rounds.length}
        label="Pattern Round"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Pattern Sequence Train */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-xs">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center mb-6">
          Pattern Train
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {currentRound.sequence.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FBF9F5] border-2 border-[#DCE4DD] flex items-center justify-center shadow-2xs"
              >
                <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${item.colorClass}`} />
              </div>
            );
          })}

          {/* Missing slot with ? */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E5EDE6] border-2 border-[#4B6F55] border-dashed flex items-center justify-center text-2xl font-black text-[#2F4535] animate-pulse">
            ?
          </div>
        </div>
      </div>

      {/* Choice Options */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center">
          Tap the Missing Piece
        </p>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
          {currentRound.options.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="p-5 rounded-3xl bg-white border-2 border-[#DCE4DD] hover:border-[#4B6F55] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 child-touch-target min-h-[120px] shadow-xs"
              >
                <Icon className={`w-10 h-10 ${opt.colorClass}`} />
                <span className="text-xs font-bold text-[#1C241E] truncate max-w-full">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
