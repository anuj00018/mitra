'use client';

import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Sprout, Sun, Flower2, Apple, UtensilsCrossed, Smile, Sparkles, BookOpen, Moon, Shirt } from 'lucide-react';

interface StoryStep {
  id: string;
  order: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STORIES: {
  [key in DifficultyLevel]: {
    title: string;
    steps: StoryStep[];
  }
} = {
  1: {
    title: 'Growing a Sunflower',
    steps: [
      { id: 'step-1', order: 1, label: '1. Plant the Seed', description: 'Dig gentle soil and place seed inside.', icon: Sprout },
      { id: 'step-2', order: 2, label: '2. Water & Sunshine', description: 'Give warm sunlight and fresh water.', icon: Sun },
      { id: 'step-3', order: 3, label: '3. Flower Blooms', description: 'A bright yellow sunflower opens up.', icon: Flower2 },
    ]
  },
  2: {
    title: 'Preparing a Fruit Bowl',
    steps: [
      { id: 'step-1', order: 1, label: '1. Pick Fresh Fruit', description: 'Gather crisp apples and oranges.', icon: Apple },
      { id: 'step-2', order: 2, label: '2. Wash Clean', description: 'Rinse fresh fruit under cool water.', icon: Sprout },
      { id: 'step-3', order: 3, label: '3. Slice Gently', description: 'Carefully cut fruit into quiet slices.', icon: UtensilsCrossed },
      { id: 'step-4', order: 4, label: '4. Enjoy Together', description: 'Share a delicious healthy snack.', icon: Smile },
    ]
  },
  3: {
    title: 'Evening Wind-Down',
    steps: [
      { id: 'step-1', order: 1, label: '1. Tidy Toys', description: 'Place blocks and games into their bins.', icon: Sparkles },
      { id: 'step-2', order: 2, label: '2. Cozy Pajamas', description: 'Change into soft, clean pajamas.', icon: Shirt },
      { id: 'step-3', order: 3, label: '3. Brush Teeth', description: 'Brush teeth clean for two minutes.', icon: Sprout },
      { id: 'step-4', order: 4, label: '4. Read Bedtime Book', description: 'Turn quiet pages with an adult.', icon: BookOpen },
      { id: 'step-5', order: 5, label: '5. Restful Sleep', description: 'Close eyes comfortably under the warm blanket.', icon: Moon },
    ]
  }
};

export function StorySequencingActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [shuffledCards, setShuffledCards] = useState<StoryStep[]>([]);
  const [placedSteps, setPlacedSteps] = useState<StoryStep[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  const currentStory = STORIES[level];
  const totalSteps = currentStory.steps.length;

  const initActivity = (lvl: DifficultyLevel) => {
    const rawSteps = [...STORIES[lvl].steps];
    // Deterministic shuffle: reverse or swap middle to present out of order
    const shuffled = rawSteps.length === 3 
      ? [rawSteps[1], rawSteps[2], rawSteps[0]]
      : rawSteps.length === 4
      ? [rawSteps[2], rawSteps[0], rawSteps[3], rawSteps[1]]
      : [rawSteps[3], rawSteps[1], rawSteps[4], rawSteps[0], rawSteps[2]];

    setShuffledCards(shuffled);
    setPlacedSteps([]);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  useEffect(() => {
    initActivity(level);
  }, [level]);

  const handleCardClick = (step: StoryStep) => {
    if (placedSteps.some(s => s.id === step.id)) return;

    setAttempts(a => a + 1);
    const expectedOrder = placedSteps.length + 1;

    if (step.order === expectedOrder) {
      // Correct chronological step
      sensoryAudio.playSuccessTone();
      const updated = [...placedSteps, step];
      setPlacedSteps(updated);
      setFeedback({
        status: 'correct',
        msg: `Correct! ${step.label} comes at this step.`
      });

      if (updated.length === totalSteps) {
        setTimeout(() => setIsCompleted(true), 600);
      }
    } else {
      // Out of order
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `Think about what happens earlier before this step.`
      });
    }
  };

  const handleReset = () => {
    initActivity(level);
  };

  if (isCompleted) {
    const duration = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (totalSteps / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="story-sequencing"
        title={`Story: ${currentStory.title}`}
        difficulty={level}
        durationSeconds={duration}
        attempts={attempts}
        errors={errors}
        score={score}
        accuracyRate={accuracy}
        onPlayAgain={handleReset}
        onNextLevel={level < 3 ? () => setLevel((level + 1) as DifficultyLevel) : undefined}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title={`Story: ${currentStory.title}`}
        objective="Develop chronological reasoning by sequencing narrative events in temporal order."
        currentLevel={level}
        onLevelChange={(lvl) => setLevel(lvl)}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 3 Steps',
          2: 'Level 2: 4 Steps',
          3: 'Level 3: 5 Steps'
        }}
      />

      <InstructionPanel
        instruction={`Put the story in order: Step ${placedSteps.length + 1} comes next.`}
        hint="What happens first, then next, then at the end?"
      />

      <ProgressIndicator
        current={placedSteps.length}
        total={totalSteps}
        label="Sequenced Story Steps"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Story Timeline Slots */}
      <div className="p-6 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-xs space-y-3">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider">
          Story Timeline (Chronological Order)
        </p>
        <div className={`grid grid-cols-1 sm:grid-cols-${totalSteps} gap-3`}>
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const placed = placedSteps[idx];
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border-2 min-h-[110px] flex flex-col items-center justify-center text-center transition-all ${
                  placed
                    ? 'bg-[#E5EDE6] border-[#4B6F55] text-[#1C241E] shadow-2xs'
                    : idx === placedSteps.length
                    ? 'bg-[#FBF9F5] border-[#4B6F55] border-dashed ring-2 ring-[#4B6F55]/20'
                    : 'bg-[#F9F6F0] border-[#E2DBD0] border-dashed opacity-60'
                }`}
              >
                {placed ? (
                  <>
                    <span className="text-xs font-bold text-[#4B6F55] uppercase">
                      Step {idx + 1}
                    </span>
                    <p className="text-sm font-extrabold text-[#1C241E] mt-1 leading-tight">
                      {placed.label.replace(/^\d+\.\s*/, '')}
                    </p>
                  </>
                ) : (
                  <span className="text-xs font-bold text-[#6B786F]">
                    Slot {idx + 1} {idx === placedSteps.length && '(Next)'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Shuffled Cards to Tap */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center">
          Choose Next Story Card
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shuffledCards.map((step) => {
            const isPlaced = placedSteps.some(s => s.id === step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                disabled={isPlaced}
                onClick={() => handleCardClick(step)}
                className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-4 text-left child-touch-target ${
                  isPlaced
                    ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-40 cursor-default'
                    : 'bg-white border-[#DCE4DD] hover:border-[#4B6F55] active:scale-[0.98] text-[#1C241E] shadow-xs'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isPlaced ? 'bg-gray-200 text-gray-400' : 'bg-[#F4F7F4] text-[#2F4535]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1C241E]">
                    {step.label.replace(/^\d+\.\s*/, '')}
                  </h4>
                  <p className="text-xs text-[#48544C] mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
