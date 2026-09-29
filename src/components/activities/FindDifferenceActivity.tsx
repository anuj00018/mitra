'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Sun, TreePine, Clock, Home, Star } from 'lucide-react';

interface DifferenceQuestion {
  id: string;
  prompt: string;
  items: {
    id: string;
    isDifferent: boolean;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    extraStyle?: string;
  }[];
}

const QUESTIONS_DATA: { [key in DifficultyLevel]: DifferenceQuestion[] } = {
  1: [
    {
      id: 'l1-q1',
      prompt: 'One of these trees is wearing autumn golden colors. Tap the different tree.',
      items: [
        { id: 't1', isDifferent: false, title: 'Green Tree', icon: TreePine, extraStyle: 'text-[#4B6F55]' },
        { id: 't2', isDifferent: true, title: 'Golden Tree', icon: TreePine, extraStyle: 'text-[#B8673E]' },
        { id: 't3', isDifferent: false, title: 'Green Tree', icon: TreePine, extraStyle: 'text-[#4B6F55]' },
      ]
    },
    {
      id: 'l1-q2',
      prompt: 'One of these stars is turned slightly. Tap the odd one.',
      items: [
        { id: 's1', isDifferent: false, title: 'Straight Star', icon: Star, extraStyle: 'text-[#B8673E]' },
        { id: 's2', isDifferent: false, title: 'Straight Star', icon: Star, extraStyle: 'text-[#B8673E]' },
        { id: 's3', isDifferent: true, title: 'Tilted Star', icon: Star, extraStyle: 'text-[#B8673E] rotate-45' },
      ]
    }
  ],
  2: [
    {
      id: 'l2-q1',
      prompt: 'One clock is pointing in a different direction. Find it.',
      items: [
        { id: 'c1', isDifferent: false, title: 'Clock', icon: Clock, extraStyle: 'text-[#3C6C82]' },
        { id: 'c2', isDifferent: false, title: 'Clock', icon: Clock, extraStyle: 'text-[#3C6C82]' },
        { id: 'c3', isDifferent: true, title: 'Rotated Clock', icon: Clock, extraStyle: 'text-[#3C6C82] rotate-90' },
        { id: 'c4', isDifferent: false, title: 'Clock', icon: Clock, extraStyle: 'text-[#3C6C82]' },
      ]
    },
    {
      id: 'l2-q2',
      prompt: 'Find the house with the different front garden tree.',
      items: [
        { id: 'h1', isDifferent: false, title: 'Pine House', icon: Home, extraStyle: 'text-[#4B6F55]' },
        { id: 'h2', isDifferent: true, title: 'Blue House', icon: Home, extraStyle: 'text-[#3C6C82]' },
        { id: 'h3', isDifferent: false, title: 'Pine House', icon: Home, extraStyle: 'text-[#4B6F55]' },
        { id: 'h4', isDifferent: false, title: 'Pine House', icon: Home, extraStyle: 'text-[#4B6F55]' },
      ]
    }
  ],
  3: [
    {
      id: 'l3-q1',
      prompt: 'Look closely at the details. Find the object with a subtle variation.',
      items: [
        { id: 'd1', isDifferent: false, title: 'Morning Sun', icon: Sun, extraStyle: 'text-[#B8673E]' },
        { id: 'd2', isDifferent: false, title: 'Morning Sun', icon: Sun, extraStyle: 'text-[#B8673E]' },
        { id: 'd3', isDifferent: false, title: 'Morning Sun', icon: Sun, extraStyle: 'text-[#B8673E]' },
        { id: 'd4', isDifferent: false, title: 'Morning Sun', icon: Sun, extraStyle: 'text-[#B8673E]' },
        { id: 'd5', isDifferent: true, title: 'Spun Sun', icon: Sun, extraStyle: 'text-[#B8673E] rotate-45 scale-90' },
        { id: 'd6', isDifferent: false, title: 'Morning Sun', icon: Sun, extraStyle: 'text-[#B8673E]' },
      ]
    }
  ]
};

export function FindDifferenceActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [qIndex, setQIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = QUESTIONS_DATA[level];
  const currentQ = questions[qIndex];

  const resetActivity = () => {
    setQIndex(0);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleSelectItem = (isDifferent: boolean, title: string) => {
    setAttempts(a => a + 1);

    if (isDifferent) {
      sensoryAudio.playSuccessTone();
      setFeedback({
        status: 'correct',
        msg: `Great eye! You noticed the difference on the ${title}.`
      });

      setTimeout(() => {
        if (qIndex + 1 < questions.length) {
          setQIndex(q => q + 1);
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
        msg: 'Those look identical. Look closely at color, size or angle.'
      });
    }
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (questions.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="find-difference"
        title="Find the Difference"
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

  const gridClass = 
    level === 1 ? 'grid-cols-3 max-w-lg' :
    level === 2 ? 'grid-cols-2 sm:grid-cols-4 max-w-2xl' :
    'grid-cols-3 sm:grid-cols-6 max-w-3xl';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="Find the Difference"
        objective="Enhance sustained visual attention and fine visual discrimination."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 3 Items',
          2: 'Level 2: 4 Grid',
          3: 'Level 3: Detailed 6'
        }}
      />

      <InstructionPanel
        instruction={currentQ.prompt}
        hint="Examine each object gently. Only one is different."
      />

      <ProgressIndicator
        current={qIndex + 1}
        total={questions.length}
        label="Round"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Observation Grid */}
      <div className={`grid ${gridClass} gap-4 mx-auto pt-4`}>
        {currentQ.items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectItem(item.isDifferent, item.title)}
              className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#DCE4DD] hover:border-[#4B6F55] active:scale-95 transition-all flex flex-col items-center justify-center gap-3 child-touch-target min-h-[140px] shadow-xs"
              aria-label={item.title}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0] flex items-center justify-center">
                <Icon className={`w-9 h-9 ${item.extraStyle || 'text-[#4B6F55]'}`} />
              </div>
              <span className="text-xs font-bold text-[#48544C]">
                Tap to inspect
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
