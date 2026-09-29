'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Sun, Sparkles, Utensils, Shirt, Footprints, Backpack, Check, Bed } from 'lucide-react';

interface RoutineStep {
  id: string;
  stepNumber: number;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROUTINE_CONFIGS: {
  [key in DifficultyLevel]: {
    theme: string;
    steps: RoutineStep[];
  };
} = {
  1: {
    theme: 'Morning Wake-Up',
    steps: [
      { id: 'r1-1', stepNumber: 1, label: 'Wake Up & Stretch', detail: 'Open eyes and take a deep morning breath.', icon: Sun },
      { id: 'r1-2', stepNumber: 2, label: 'Wash Face & Hands', detail: 'Splash warm clean water gently.', icon: Sparkles },
      { id: 'r1-3', stepNumber: 3, label: 'Eat Nutritious Breakfast', detail: 'Nourish the body with fruit and cereal.', icon: Utensils },
    ]
  },
  2: {
    theme: 'School Departure Routine',
    steps: [
      { id: 'r2-1', stepNumber: 1, label: 'Put on School Clothes', detail: 'Wear clean shirt and comfortable pants.', icon: Shirt },
      { id: 'r2-2', stepNumber: 2, label: 'Brush Teeth', detail: 'Brush top, bottom, and front teeth.', icon: Sparkles },
      { id: 'r2-3', stepNumber: 3, label: 'Pack School Backpack', detail: 'Check notebook, crayons, and water bottle.', icon: Backpack },
      { id: 'r2-4', stepNumber: 4, label: 'Put on Shoes & Coat', detail: 'Tie straps and zip coat closed.', icon: Footprints },
    ]
  },
  3: {
    theme: 'Evening Wind-Down & Bedtime',
    steps: [
      { id: 'r3-1', stepNumber: 1, label: 'Put Away Games & Blocks', detail: 'Return items to their calm homes.', icon: Sparkles },
      { id: 'r3-2', stepNumber: 2, label: 'Warm Bath or Shower', detail: 'Relax warm muscles after a busy day.', icon: Sun },
      { id: 'r3-3', stepNumber: 3, label: 'Change into Pajamas', detail: 'Slip into soft, cozy sleep clothes.', icon: Shirt },
      { id: 'r3-4', stepNumber: 4, label: 'Listen to Bedtime Story', detail: 'Follow along with a gentle book.', icon: Backpack },
      { id: 'r3-5', stepNumber: 5, label: 'Restful Sleep', detail: 'Turn on calm nightlight and rest.', icon: Bed },
    ]
  }
};

export function DailyRoutineBuilderActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [placedSteps, setPlacedSteps] = useState<RoutineStep[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const startTimeRef = useRef<number>(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [level]);

  const routine = ROUTINE_CONFIGS[level];
  const totalSteps = routine.steps.length;

  const resetActivity = () => {
    setPlacedSteps([]);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    startTimeRef.current = Date.now();
    setSessionDuration(0);
    setIsCompleted(false);
  };

  const handleSelectStep = (step: RoutineStep) => {
    if (placedSteps.some(s => s.id === step.id)) return;

    setAttempts(a => a + 1);
    const expectedStepNum = placedSteps.length + 1;

    if (step.stepNumber === expectedStepNum) {
      sensoryAudio.playSuccessTone();
      const updated = [...placedSteps, step];
      setPlacedSteps(updated);
      setFeedback({
        status: 'correct',
        msg: `Step ${step.stepNumber} (${step.label}) placed into routine!`
      });

      if (updated.length === totalSteps) {
        const elapsed = Math.max(15, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
        setSessionDuration(elapsed);
        setTimeout(() => setIsCompleted(true), 600);
      }
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `Think about what needs to happen before ${step.label}.`
      });
    }
  };

  if (isCompleted) {
    const accuracy = attempts > 0 ? Math.max(0.6, (totalSteps / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="routine-builder"
        title={`Routine: ${routine.theme}`}
        difficulty={level}
        durationSeconds={sessionDuration}
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

  // Generate scrambled choices so child has to pick the correct next step
  const remainingSteps = routine.steps.filter(s => !placedSteps.some(p => p.id === s.id));
  const scrambledRemaining = [...remainingSteps].reverse();

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title={`Routine: ${routine.theme}`}
        objective="Build daily transition autonomy by assembling structured personal schedules."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 3 Steps',
          2: 'Level 2: 4 Steps',
          3: 'Level 3: 5 Steps'
        }}
      />

      <InstructionPanel
        instruction={`Choose Step ${placedSteps.length + 1} to build your ${routine.theme}.`}
        hint="Follow natural morning and evening chronological order."
      />

      <ProgressIndicator
        current={placedSteps.length}
        total={totalSteps}
        label="Routine Steps Assembled"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Routine Slots Track */}
      <div className="p-6 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-xs space-y-3">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider">
          Routine Schedule Board ({routine.theme})
        </p>
        <div className="space-y-2.5">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const placed = placedSteps[idx];
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  placed
                    ? 'bg-[#E5EDE6] border-[#4B6F55] text-[#1C241E]'
                    : idx === placedSteps.length
                    ? 'bg-[#FBF9F5] border-[#4B6F55] border-dashed ring-2 ring-[#4B6F55]/20'
                    : 'bg-[#F9F6F0] border-[#E2DBD0] border-dashed opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    placed ? 'bg-[#4B6F55] text-white' : 'bg-[#E8E2D5] text-[#48544C]'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#1C241E]">
                      {placed ? placed.label : `Step ${idx + 1} Empty`}
                    </h4>
                    {placed && (
                      <p className="text-xs text-[#48544C]">{placed.detail}</p>
                    )}
                  </div>
                </div>

                {placed && (
                  <Check className="w-5 h-5 text-[#4B6F55]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Next Steps */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center">
          Available Steps to Place
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scrambledRemaining.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSelectStep(step)}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#DCE4DD] hover:border-[#4B6F55] active:scale-95 transition-all flex items-center gap-4 text-left child-touch-target shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F4F7F4] text-[#2F4535] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1C241E]">{step.label}</h4>
                  <p className="text-xs text-[#48544C] mt-0.5">{step.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
