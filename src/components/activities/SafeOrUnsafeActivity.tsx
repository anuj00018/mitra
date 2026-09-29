'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Check, X, ShieldAlert } from 'lucide-react';

interface SafetyScenario {
  id: string;
  situation: string;
  isSafe: boolean;
  explanation: string;
}

const SAFETY_SCENARIOS: { [key in DifficultyLevel]: SafetyScenario[] } = {
  1: [
    {
      id: 's1-1',
      situation: 'Holding a parent or educator\'s hand in a parking lot.',
      isSafe: true,
      explanation: 'Holding hands keeps you visible and safe near moving vehicles.'
    },
    {
      id: 's1-2',
      situation: 'Touching a hot metal pan on the cooking stove.',
      isSafe: false,
      explanation: 'Hot pans can cause painful burns. Keep hands back and ask an adult.'
    }
  ],
  2: [
    {
      id: 's2-1',
      situation: 'Fastening the safety seatbelt before the car starts moving.',
      isSafe: true,
      explanation: 'Seatbelts hold our bodies securely in car seats.'
    },
    {
      id: 's2-2',
      situation: 'Drinking liquid from an unlabelled cleaning bottle in the cupboard.',
      isSafe: false,
      explanation: 'Unknown cleaning liquids are harmful chemicals. Only drink clean water.'
    },
    {
      id: 's2-3',
      situation: 'Wearing a fastened helmet while riding a bicycle or scooter.',
      isSafe: true,
      explanation: 'Helmets cushion and protect our head if we wobble or slip.'
    }
  ],
  3: [
    {
      id: 's3-1',
      situation: 'Asking a dog\'s owner politely before petting a new dog.',
      isSafe: true,
      explanation: 'Asking ensures the dog is calm and happy to receive gentle pats.'
    },
    {
      id: 's3-2',
      situation: 'Walking out of the school playground gate without telling a teacher.',
      isSafe: false,
      explanation: 'Always stay within the school boundary where educators can supervise.'
    },
    {
      id: 's3-3',
      situation: 'Telling a trusted teacher or parent if someone makes you feel uncomfortable.',
      isSafe: true,
      explanation: 'Speaking up to trusted adults protects your personal boundaries.'
    },
    {
      id: 's3-4',
      situation: 'Placing sharp metal objects into an electrical wall socket.',
      isSafe: false,
      explanation: 'Electrical sockets carry electric current. Keep all objects away.'
    }
  ]
};

export function SafeOrUnsafeActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [qIndex, setQIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  const scenarioList = SAFETY_SCENARIOS[level];
  const currentQ = scenarioList[qIndex];

  const resetActivity = () => {
    setQIndex(0);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleChoice = (choseSafe: boolean) => {
    setAttempts(a => a + 1);

    if (choseSafe === currentQ.isSafe) {
      sensoryAudio.playSuccessTone();
      setFeedback({
        status: 'correct',
        msg: `Correct! ${currentQ.isSafe ? 'That is SAFE.' : 'That is UNSAFE.'} ${currentQ.explanation}`
      });

      setTimeout(() => {
        if (qIndex + 1 < scenarioList.length) {
          setQIndex(q => q + 1);
          setFeedback({ status: 'neutral', msg: '' });
        } else {
          setIsCompleted(true);
        }
      }, 1400);
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `Let's reflect: ${currentQ.explanation}`
      });
    }
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (scenarioList.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="safe-unsafe"
        title="Safe or Unsafe?"
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
        title="Safe or Unsafe?"
        objective="Develop situational awareness, body safety rules, and personal boundary discernment."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 2 Basics',
          2: 'Level 2: 3 Boundaries',
          3: 'Level 3: 4 Situations'
        }}
      />

      <InstructionPanel
        instruction="Read or listen to the situation, then decide: Is it Safe or Unsafe?"
        hint={currentQ.explanation}
      />

      <ProgressIndicator
        current={qIndex + 1}
        total={scenarioList.length}
        label="Safety Scenario"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Situation Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#DCE4DD] text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0] flex items-center justify-center text-[#4B6F55]">
          <ShieldAlert className="w-8 h-8 text-[#B8673E]" />
        </div>

        <h3 className="text-xl sm:text-3xl font-extrabold text-[#1C241E] leading-relaxed max-w-xl mx-auto">
          &ldquo;{currentQ.situation}&rdquo;
        </h3>

        <p className="text-sm font-semibold text-[#6B786F]">
          What should we do? Is this Safe or Unsafe?
        </p>
      </div>

      {/* Big Action Decision Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
        
        {/* SAFE BUTTON */}
        <button
          type="button"
          onClick={() => handleChoice(true)}
          className="p-6 sm:p-8 rounded-3xl bg-[#E5EDE6] border-3 border-[#4B6F55] hover:bg-[#D5E5D8] active:scale-95 transition-all flex items-center justify-center gap-4 child-touch-target min-h-[140px] shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#4B6F55] text-white flex items-center justify-center shadow-xs shrink-0">
            <Check className="w-8 h-8" />
          </div>
          <div className="text-left">
            <span className="text-2xl sm:text-3xl font-black text-[#2F4535] block">
              SAFE 🟢
            </span>
            <span className="text-xs sm:text-sm text-[#4B6F55] font-semibold">
              Good choice for our body & mind
            </span>
          </div>
        </button>

        {/* UNSAFE BUTTON */}
        <button
          type="button"
          onClick={() => handleChoice(false)}
          className="p-6 sm:p-8 rounded-3xl bg-[#FCF8F3] border-3 border-[#B8673E] hover:bg-[#F7EEE3] active:scale-95 transition-all flex items-center justify-center gap-4 child-touch-target min-h-[140px] shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#B8673E] text-white flex items-center justify-center shadow-xs shrink-0">
            <X className="w-8 h-8" />
          </div>
          <div className="text-left">
            <span className="text-2xl sm:text-3xl font-black text-[#9A522E] block">
              UNSAFE 🔴
            </span>
            <span className="text-xs sm:text-sm text-[#B8673E] font-semibold">
              Needs caution or an adult pause
            </span>
          </div>
        </button>

      </div>

    </div>
  );
}
