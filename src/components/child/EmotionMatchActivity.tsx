'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Volume2, ArrowLeft, Sparkles } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface EmotionQuestion {
  id: number;
  scenario: string;
  avatarFace: string;
  targetEmotion: string;
  contextHint: string;
}

const QUESTIONS: EmotionQuestion[] = [
  {
    id: 1,
    scenario: "Maya is reading her favorite story in a quiet corner.",
    avatarFace: "😌",
    targetEmotion: "Calm",
    contextHint: "Her shoulders are relaxed and breathing is gentle."
  },
  {
    id: 2,
    scenario: "Aarav built a tall wooden tower all by himself!",
    avatarFace: "😄",
    targetEmotion: "Happy",
    contextHint: "His smile is big and eyes are bright."
  },
  {
    id: 3,
    scenario: "A sudden loud thunderstorm sounds outside the window.",
    avatarFace: "😮",
    targetEmotion: "Surprised",
    contextHint: "Eyes open wide at the unexpected noise."
  }
];

const EMOTION_OPTIONS = [
  { label: 'Calm', emoji: '😌', bg: 'bg-[#E5EDE6]', border: 'border-[#4B6F55]' },
  { label: 'Happy', emoji: '😄', bg: 'bg-[#F7EEE3]', border: 'border-[#B8673E]' },
  { label: 'Sad', emoji: '😢', bg: 'bg-[#E1EEF5]', border: 'border-[#3C6C82]' },
  { label: 'Surprised', emoji: '😮', bg: 'bg-[#F4F7F4]', border: 'border-[#6B786F]' }
];

export function EmotionMatchActivity({ onExit }: { onExit: () => void }) {
  const { activeChild, logSession } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  const currentQ = QUESTIONS[currentIdx];

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Read question instruction when loaded
    sensoryAudio.speakInstruction(currentQ.scenario, activeChild.sensoryPreferences.voiceSpeed);
  }, [currentIdx, currentQ.scenario, activeChild]);

  const handleSelect = (emotion: string) => {
    setSelectedChoice(emotion);
    if (emotion === currentQ.targetEmotion) {
      setIsCorrect(true);
      sensoryAudio.playSuccessTone();
      sensoryAudio.speakInstruction(`Yes! That is ${emotion}. Wonderful!`, activeChild.sensoryPreferences.voiceSpeed);

      // Trigger soft confetti
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#4B6F55', '#B8673E', '#3C6C82']
        });
      } catch {}

      setTimeout(() => {
        if (currentIdx + 1 < QUESTIONS.length) {
          setCurrentIdx(prev => prev + 1);
          setSelectedChoice(null);
          setIsCorrect(null);
        } else {
          // Completed all cards
          setIsFinished(true);
          const duration = Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
          logSession({
            childId: activeChild.id,
            activityId: 'emotion-match',
            activityTitle: 'Feelings & Emotions',
            durationSeconds: duration,
            completed: true,
            promptsNeeded: promptsUsed,
            accuracyRate: promptsUsed === 0 ? 1.0 : 0.85,
            sensoryFatigueFlag: false,
            childMood: 'happy'
          });
        }
      }, 1400);
    } else {
      setIsCorrect(false);
      setPromptsUsed(prev => prev + 1);
      sensoryAudio.playGentlePrompt();
      sensoryAudio.speakInstruction(`That's okay. Let's look again: ${currentQ.contextHint}`, activeChild.sensoryPreferences.voiceSpeed);
    }
  };

  const handleHearHint = () => {
    setPromptsUsed(prev => prev + 1);
    sensoryAudio.speakInstruction(currentQ.contextHint, activeChild.sensoryPreferences.voiceSpeed);
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-md space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center text-5xl">
            🌟
          </div>
          <h2 className="text-3xl font-extrabold text-[#1C241E]">
            Great Exploring, {activeChild.displayName}!
          </h2>
          <p className="text-lg text-[#48544C]">
            You recognized all the feelings and completed today&apos;s emotion activity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4B6F55] text-white font-bold text-lg hover:bg-[#3D5A45] transition-all shadow-xs"
            >
              Back to Activities
            </button>
            <button
              onClick={() => {
                setCurrentIdx(0);
                setSelectedChoice(null);
                setIsCorrect(null);
                setIsFinished(false);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#F3EFE6] text-[#1C241E] font-semibold text-base hover:bg-[#E8E2D5] transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* Top Controls: Back button & Progress dots */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DCE4DD] text-sm font-bold text-[#1C241E] hover:bg-[#F4F7F4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        {/* Calm Progress indicators */}
        <div className="flex items-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                i === currentIdx
                  ? 'bg-[#4B6F55] scale-125'
                  : i < currentIdx
                  ? 'bg-[#A8C4AE]'
                  : 'bg-[#E2DBD0]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Emotion Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-sm mb-8 text-center space-y-4">
        
        {/* Large Emoji Face */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-3xl bg-[#FBF9F5] border-2 border-[#E2DBD0] flex items-center justify-center text-6xl sm:text-7xl shadow-inner">
          {currentQ.avatarFace}
        </div>

        {/* Scenario Text with Audio readout button */}
        <div className="flex items-center justify-center gap-3 max-w-xl mx-auto pt-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#1C241E] leading-snug">
            {currentQ.scenario}
          </h2>
          <button
            onClick={() => sensoryAudio.speakInstruction(currentQ.scenario, activeChild.sensoryPreferences.voiceSpeed)}
            className="p-3 rounded-2xl bg-[#E5EDE6] text-[#2F4535] hover:bg-[#C7D9CA] transition-colors shrink-0"
            aria-label="Read question scenario aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        <p className="text-base font-semibold text-[#48544C]">
          How do they feel?
        </p>

        {/* Gentle hint trigger */}
        <button
          onClick={handleHearHint}
          className="text-xs sm:text-sm font-semibold text-[#4B6F55] hover:underline inline-flex items-center gap-1"
        >
          <Sparkles className="w-4 h-4" />
          Need a gentle clue?
        </button>
      </div>

      {/* Emotion Options (Large 70px+ touch targets) */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {EMOTION_OPTIONS.map((opt) => {
          const isSelected = selectedChoice === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              className={`p-6 sm:p-8 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ${
                isSelected && isCorrect === true
                  ? 'bg-[#E5EDE6] border-[#4B6F55] ring-4 ring-[#4B6F55]/30'
                  : isSelected && isCorrect === false
                  ? 'bg-[#FCF8F3] border-[#B8673E]'
                  : `${opt.bg} ${opt.border} hover:scale-[1.02] active:scale-[0.98]`
              }`}
            >
              <span className="text-4xl sm:text-5xl">{opt.emoji}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#1C241E]">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
