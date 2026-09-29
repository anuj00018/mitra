'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Utensils, Bed, Coffee, Sparkles, BookOpen, Shirt } from 'lucide-react';

interface EverydayItem {
  id: string;
  name: string;
  room: 'kitchen' | 'bathroom' | 'bedroom' | 'classroom';
  functionQuestion?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ITEMS_POOL: EverydayItem[] = [
  { id: 'fork', name: 'Fork & Spoon', room: 'kitchen', functionQuestion: 'Which object do we use to eat food?', icon: Utensils },
  { id: 'cup', name: 'Drinking Cup', room: 'kitchen', functionQuestion: 'Which object holds water to drink?', icon: Coffee },
  { id: 'soap', name: 'Bath Soap', room: 'bathroom', functionQuestion: 'Which object washes clean bubbles?', icon: Sparkles },
  { id: 'towel', name: 'Soft Towel', room: 'bathroom', functionQuestion: 'Which object dries our hands?', icon: Shirt },
  { id: 'pillow', name: 'Sleeping Pillow', room: 'bedroom', functionQuestion: 'Which object supports our head in bed?', icon: Bed },
  { id: 'pencil', name: 'Writing Pencil', room: 'classroom', functionQuestion: 'Which object writes in a notebook?', icon: BookOpen },
];

export function EverydayObjectsActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  // Level 1: Find 2 Kitchen items among 4 choices
  // Level 2: Find all Bathroom items
  // Level 3: Function question (e.g. Which object do we use to drink water?)
  const targetItems = level === 1 
    ? ITEMS_POOL.filter(i => i.room === 'kitchen') 
    : level === 2 
    ? ITEMS_POOL.filter(i => i.room === 'bathroom')
    : [ITEMS_POOL[1]]; // Cup for drinking

  const resetActivity = () => {
    setFoundIds([]);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleSelectItem = (item: EverydayItem) => {
    if (foundIds.includes(item.id)) return;

    setAttempts(a => a + 1);

    const isMatch = level === 1 
      ? item.room === 'kitchen' 
      : level === 2 
      ? item.room === 'bathroom' 
      : item.id === 'cup';

    if (isMatch) {
      sensoryAudio.playSuccessTone();
      const nextFound = [...foundIds, item.id];
      setFoundIds(nextFound);
      setFeedback({
        status: 'correct',
        msg: `Yes! ${item.name} belongs here.`
      });

      if (nextFound.length >= targetItems.length) {
        setTimeout(() => setIsCompleted(true), 600);
      }
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `${item.name} usually lives in a different room. Think about where we find it.`
      });
    }
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (targetItems.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="everyday-objects"
        title="Everyday Objects"
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

  const promptText = 
    level === 1 ? 'Find the objects that belong in the Kitchen 🍳' :
    level === 2 ? 'Find the objects that belong in the Bathroom 🛁' :
    'Which object holds water to drink? 💧';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="Everyday Objects"
        objective="Categorize daily household items by room location and functional purpose."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: Kitchen',
          2: 'Level 2: Bathroom',
          3: 'Level 3: Object Function'
        }}
      />

      <InstructionPanel
        instruction={promptText}
        hint="Tap the items that match the target room."
      />

      <ProgressIndicator
        current={foundIds.length}
        total={targetItems.length}
        label="Target Items Discovered"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Grid of Household Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
        {ITEMS_POOL.map((item) => {
          const isFound = foundIds.includes(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isFound}
              onClick={() => handleSelectItem(item)}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 child-touch-target min-h-[140px] ${
                isFound
                  ? 'bg-[#E5EDE6] border-[#4B6F55] opacity-60 cursor-default'
                  : 'bg-white border-[#DCE4DD] hover:border-[#4B6F55] active:scale-95 shadow-xs'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F4F7F4] text-[#2F4535] flex items-center justify-center">
                <Icon className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-[#1C241E]">{item.name}</h4>
                <span className="text-[11px] text-[#6B786F] capitalize">Room: {item.room}</span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
