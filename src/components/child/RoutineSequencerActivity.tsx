'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { ArrowLeft, Check, Volume2 } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface Step {
  id: number;
  label: string;
  emoji: string;
  done: boolean;
  instruction: string;
}

const DEFAULT_STEPS: Step[] = [
  { id: 1, label: 'Brush Teeth', emoji: '🪥', done: false, instruction: 'Brush clean and bright with water.' },
  { id: 2, label: 'Wash Hands', emoji: '🧼', done: false, instruction: 'Rub soap gently with warm water.' },
  { id: 3, label: 'Put on Shoes', emoji: '👟', done: false, instruction: 'Slip shoes on and press straps down.' },
  { id: 4, label: 'Pack Backpack', emoji: '🎒', done: false, instruction: 'Zip backpack closed for school.' },
];

export function RoutineSequencerActivity({ onExit }: { onExit: () => void }) {
  const { activeChild, logSession } = useApp();
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS);
  const startTimeRef = useRef<number>(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const activeStep = steps.find(s => !s.done);

  const handleStepDone = (id: number) => {
    sensoryAudio.playSuccessTone();
    const updated = steps.map(s => (s.id === id ? { ...s, done: true } : s));
    setSteps(updated);

    const allFinished = updated.every(s => s.done);
    if (allFinished) {
      setIsFinished(true);
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#4B6F55', '#B8673E', '#2C5264']
        });
      } catch {}

      const duration = Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
      logSession({
        childId: activeChild.id,
        activityId: 'daily-routine',
        activityTitle: 'First-Then Routine',
        durationSeconds: duration,
        completed: true,
        promptsNeeded: 0,
        accuracyRate: 1.0,
        sensoryFatigueFlag: false,
        childMood: 'calm'
      });
      sensoryAudio.speakInstruction('All routine steps are finished! Fantastic job!', activeChild.sensoryPreferences.voiceSpeed);
    } else {
      const nextStep = updated.find(s => !s.done);
      if (nextStep) {
        sensoryAudio.speakInstruction(`Step finished! Next is: ${nextStep.label}`, activeChild.sensoryPreferences.voiceSpeed);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-md space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center text-5xl">
            🎉
          </div>
          <h2 className="text-3xl font-extrabold text-[#1C241E]">
            All Routine Steps Complete!
          </h2>
          <p className="text-lg text-[#48544C]">
            You completed every step of your visual schedule independently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4B6F55] text-white font-bold text-lg hover:bg-[#3D5A45] transition-all"
            >
              Back to Activities
            </button>
            <button
              onClick={() => {
                setSteps(DEFAULT_STEPS.map(s => ({ ...s, done: false })));
                setIsFinished(false);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#F3EFE6] text-[#1C241E] font-semibold text-base hover:bg-[#E8E2D5]"
            >
              Reset Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DCE4DD] text-sm font-bold text-[#1C241E] hover:bg-[#F4F7F4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>
        <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#E5EDE6] text-[#2F4535]">
          First - Then Visual Flow
        </span>
      </div>

      {/* First / Then Highlight Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        
        {/* FIRST CARD */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#4B6F55] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-[#4B6F55] text-white tracking-wider">
              1. FIRST DO THIS
            </span>
            {activeStep && (
              <button
                onClick={() => sensoryAudio.speakInstruction(`First: ${activeStep.label}. ${activeStep.instruction}`, activeChild.sensoryPreferences.voiceSpeed)}
                className="p-1.5 rounded-lg text-[#4B6F55] hover:bg-[#E5EDE6]"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
          {activeStep ? (
            <div className="flex items-center gap-4 py-2">
              <span className="text-5xl">{activeStep.emoji}</span>
              <div>
                <h3 className="text-2xl font-black text-[#1C241E]">{activeStep.label}</h3>
                <p className="text-sm text-[#48544C]">{activeStep.instruction}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#4B6F55] font-bold">All current steps done!</p>
          )}
        </div>

        {/* THEN CARD */}
        <div className="p-6 rounded-3xl bg-[#FBF9F5] border-2 border-[#DCE4DD]">
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-[#F3EFE6] text-[#48544C] tracking-wider mb-3 inline-block">
            2. THEN DO NEXT
          </span>
          {(() => {
            const nextStep = steps.filter(s => !s.done)[1];
            if (nextStep) {
              return (
                <div className="flex items-center gap-4 py-2">
                  <span className="text-5xl opacity-80">{nextStep.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#48544C]">{nextStep.label}</h3>
                    <p className="text-sm text-[#6B786F]">Ready after step 1</p>
                  </div>
                </div>
              );
            }
            return (
              <div className="py-3">
                <h3 className="text-xl font-bold text-[#4B6F55]">Free Play / Reward Time! 🎈</h3>
                <p className="text-sm text-[#6B786F]">You are almost at your break.</p>
              </div>
            );
          })()}
        </div>

      </div>

      {/* Routine Steps List (Large Clickable Rows) */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-5 sm:p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${
              step.done
                ? 'bg-[#E5EDE6]/60 border-[#C7D9CA] opacity-80'
                : activeStep?.id === step.id
                ? 'bg-white border-[#4B6F55] shadow-md ring-2 ring-[#4B6F55]/20'
                : 'bg-white border-[#E2DBD0]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">{step.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6B786F]">Step {idx + 1}</span>
                  <h4 className={`text-lg sm:text-2xl font-extrabold ${step.done ? 'line-through text-[#6B786F]' : 'text-[#1C241E]'}`}>
                    {step.label}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#48544C]">{step.instruction}</p>
              </div>
            </div>

            {step.done ? (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#C7D9CA] text-[#2F4535] font-bold text-sm">
                <Check className="w-5 h-5" />
                Done
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleStepDone(step.id)}
                className="child-touch-target px-6 py-3 rounded-2xl bg-[#4B6F55] hover:bg-[#3D5A45] text-white font-extrabold text-base shadow-xs"
              >
                Mark Finished
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
