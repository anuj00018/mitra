'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { 
  Key, 
  Lock, 
  BookOpen, 
  Glasses, 
  Pencil, 
  FileText,
  Paintbrush,
  Palette,
  Bed,
  Moon
} from 'lucide-react';

interface PairItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchId: string;
}

const ALL_PAIRS: { [key in DifficultyLevel]: { left: PairItem[]; right: PairItem[] } } = {
  1: {
    left: [
      { id: 'key', label: 'Key', icon: Key, matchId: 'lock' },
      { id: 'book', label: 'Book', icon: BookOpen, matchId: 'glasses' },
      { id: 'pencil', label: 'Pencil', icon: Pencil, matchId: 'paper' },
    ],
    right: [
      { id: 'glasses', label: 'Glasses', icon: Glasses, matchId: 'book' },
      { id: 'lock', label: 'Lock', icon: Lock, matchId: 'key' },
      { id: 'paper', label: 'Paper', icon: FileText, matchId: 'pencil' },
    ]
  },
  2: {
    left: [
      { id: 'key', label: 'Key', icon: Key, matchId: 'lock' },
      { id: 'book', label: 'Book', icon: BookOpen, matchId: 'glasses' },
      { id: 'pencil', label: 'Pencil', icon: Pencil, matchId: 'paper' },
      { id: 'brush', label: 'Paintbrush', icon: Paintbrush, matchId: 'palette' },
    ],
    right: [
      { id: 'palette', label: 'Palette', icon: Palette, matchId: 'brush' },
      { id: 'lock', label: 'Lock', icon: Lock, matchId: 'key' },
      { id: 'glasses', label: 'Glasses', icon: Glasses, matchId: 'book' },
      { id: 'paper', label: 'Paper', icon: FileText, matchId: 'pencil' },
    ]
  },
  3: {
    left: [
      { id: 'key', label: 'Key', icon: Key, matchId: 'lock' },
      { id: 'book', label: 'Book', icon: BookOpen, matchId: 'glasses' },
      { id: 'pencil', label: 'Pencil', icon: Pencil, matchId: 'paper' },
      { id: 'brush', label: 'Paintbrush', icon: Paintbrush, matchId: 'palette' },
      { id: 'bed', label: 'Bed', icon: Bed, matchId: 'moon' },
    ],
    right: [
      { id: 'glasses', label: 'Glasses', icon: Glasses, matchId: 'book' },
      { id: 'palette', label: 'Palette', icon: Palette, matchId: 'brush' },
      { id: 'moon', label: 'Night Moon', icon: Moon, matchId: 'bed' },
      { id: 'paper', label: 'Paper', icon: FileText, matchId: 'pencil' },
      { id: 'lock', label: 'Lock', icon: Lock, matchId: 'key' },
    ]
  }
};

export function ObjectMatchingActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  const currentData = ALL_PAIRS[level];
  const totalPairs = currentData.left.length;

  const resetActivity = () => {
    setSelectedLeft(null);
    setMatchedIds([]);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleSelectLeft = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedLeft(id);
    sensoryAudio.playSoftChime(440, 0.2);
    setFeedback({ status: 'neutral', msg: '' });
  };

  const handleSelectRight = (rightItem: PairItem) => {
    if (matchedIds.includes(rightItem.id)) return;
    if (!selectedLeft) {
      sensoryAudio.playGentlePrompt();
      setFeedback({
        status: 'incorrect',
        msg: 'Please choose an object from the left column first.'
      });
      return;
    }

    setAttempts(a => a + 1);
    const leftItem = currentData.left.find(i => i.id === selectedLeft);

    if (leftItem && leftItem.matchId === rightItem.id) {
      // Match found!
      sensoryAudio.playSuccessTone();
      const nextMatched = [...matchedIds, leftItem.id, rightItem.id];
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      setFeedback({
        status: 'correct',
        msg: `${leftItem.label} pairs naturally with ${rightItem.label}!`
      });

      if (nextMatched.length / 2 === totalPairs) {
        setTimeout(() => setIsCompleted(true), 600);
      }
    } else {
      // Incorrect
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `Those two do not match. Think about what we use ${leftItem?.label} with.`
      });
      setSelectedLeft(null);
    }
  };

  if (isCompleted) {
    const duration = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (totalPairs / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="object-matching"
        title="Object Matching"
        difficulty={level}
        durationSeconds={duration}
        attempts={attempts}
        errors={errors}
        score={score}
        accuracyRate={accuracy}
        onPlayAgain={resetActivity}
        onNextLevel={level < 3 ? () => { setLevel((level + 1) as DifficultyLevel); resetActivity(); } : undefined}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="Object Matching"
        objective="Identify functional relationships by matching objects that belong together."
        currentLevel={level}
        onLevelChange={(newLevel) => {
          setLevel(newLevel);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 3 Pairs',
          2: 'Level 2: 4 Pairs',
          3: 'Level 3: 5 Pairs'
        }}
      />

      <InstructionPanel
        instruction={
          selectedLeft 
            ? 'Now tap the matching partner in the right column.' 
            : 'Tap an object on the left to start.'
        }
        hint="Example: A key goes into a lock."
      />

      <ProgressIndicator
        current={matchedIds.length / 2}
        total={totalPairs}
        label="Matched Pairs"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Two Column Matching Layout */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-2">
        
        {/* Left Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center">
            Column A
          </p>
          {currentData.left.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isMatched}
                onClick={() => handleSelectLeft(item.id)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-3 sm:gap-4 child-touch-target ${
                  isMatched
                    ? 'bg-[#E5EDE6]/60 border-[#C7D9CA] text-[#48544C] opacity-50 cursor-default'
                    : isSelected
                    ? 'bg-[#E5EDE6] border-[#4B6F55] ring-3 ring-[#4B6F55]/20 scale-[1.02] shadow-sm'
                    : 'bg-white border-[#DCE4DD] hover:border-[#4B6F55] text-[#1C241E] shadow-2xs'
                }`}
                aria-pressed={isSelected}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isMatched ? 'bg-gray-100 text-gray-400' : 'bg-[#F4F7F4] text-[#2F4535]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base sm:text-lg font-bold text-left">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center">
            Column B
          </p>
          {currentData.right.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isMatched}
                onClick={() => handleSelectRight(item)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-3 sm:gap-4 child-touch-target ${
                  isMatched
                    ? 'bg-[#E5EDE6]/60 border-[#C7D9CA] text-[#48544C] opacity-50 cursor-default'
                    : 'bg-white border-[#DCE4DD] hover:border-[#B8673E] text-[#1C241E] shadow-2xs'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isMatched ? 'bg-gray-100 text-gray-400' : 'bg-[#FCF8F3] text-[#B8673E]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base sm:text-lg font-bold text-left">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
