'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { HeartHandshake } from 'lucide-react';

interface EmotionScenario {
  id: string;
  scenario: string;
  contextHint: string;
  correctEmotion: string;
  options: { label: string; description: string; emoji: string }[];
}

const SCENARIOS: { [key in DifficultyLevel]: EmotionScenario[] } = {
  1: [
    {
      id: 'sc-1',
      scenario: 'Liam finishes his drawing of a green garden and shows it with relaxed shoulders.',
      contextHint: 'His face is peaceful and quiet.',
      correctEmotion: 'Calm',
      options: [
        { label: 'Calm', description: 'Peaceful and steady body', emoji: '😌' },
        { label: 'Happy', description: 'Excited and smiling', emoji: '😄' }
      ]
    },
    {
      id: 'sc-2',
      scenario: 'Liam receives a surprise visit from his favorite puppy friend!',
      contextHint: 'His eyes sparkle and he smiles brightly.',
      correctEmotion: 'Happy',
      options: [
        { label: 'Happy', description: 'Excited and smiling', emoji: '😄' },
        { label: 'Calm', description: 'Peaceful and steady body', emoji: '😌' }
      ]
    }
  ],
  2: [
    {
      id: 'sc-1',
      scenario: 'The tower of blocks gently tumbled over on the carpet.',
      contextHint: 'Eyes look down quietly and lips form a soft frown.',
      correctEmotion: 'Sad',
      options: [
        { label: 'Happy', description: 'Joyful and bright', emoji: '😄' },
        { label: 'Sad', description: 'Needs a comfort pause', emoji: '😢' },
        { label: 'Surprised', description: 'Eyes open wide', emoji: '😮' }
      ]
    },
    {
      id: 'sc-2',
      scenario: 'The magician pulls a gentle blue flower out of a book!',
      contextHint: 'Eyes and mouth open wide in amazement.',
      correctEmotion: 'Surprised',
      options: [
        { label: 'Surprised', description: 'Eyes open wide', emoji: '😮' },
        { label: 'Sad', description: 'Needs a comfort pause', emoji: '😢' },
        { label: 'Happy', description: 'Joyful and bright', emoji: '😄' }
      ]
    },
    {
      id: 'sc-3',
      scenario: 'Drinking warm milk and listening to a calm bedtime lullaby.',
      contextHint: 'Breathing is deep and body is resting.',
      correctEmotion: 'Happy',
      options: [
        { label: 'Happy', description: 'Content and joyful', emoji: '😄' },
        { label: 'Surprised', description: 'Unexpected sound', emoji: '😮' },
        { label: 'Sad', description: 'Tearful or unhappy', emoji: '😢' }
      ]
    }
  ],
  3: [
    {
      id: 'sc-1',
      scenario: 'The school cafeteria has many loud conversations, clattering trays, and bright lights.',
      contextHint: 'Hands cover ears and head lowers seeking quiet space.',
      correctEmotion: 'Overwhelmed',
      options: [
        { label: 'Calm', description: 'Settled and comfortable', emoji: '😌' },
        { label: 'Overwhelmed', description: 'Too much sensory input', emoji: '😣' },
        { label: 'Proud', description: 'Happy with achievements', emoji: '🌟' },
        { label: 'Frustrated', description: 'Trying hard when stuck', emoji: '😤' }
      ]
    },
    {
      id: 'sc-2',
      scenario: 'Aarav tied his shoelaces all by himself after practicing for three weeks!',
      contextHint: 'Stands up tall with a proud beaming grin.',
      correctEmotion: 'Proud',
      options: [
        { label: 'Proud', description: 'Celebrating effort and success', emoji: '🌟' },
        { label: 'Overwhelmed', description: 'Too much noise', emoji: '😣' },
        { label: 'Calm', description: 'Resting quietly', emoji: '😌' },
        { label: 'Frustrated', description: 'Blocked by obstacles', emoji: '😤' }
      ]
    },
    {
      id: 'sc-3',
      scenario: 'Sitting in the quiet corner with weighted blanket and noise-cancelling headphones.',
      contextHint: 'Heartbeat slows down to a comfortable steady rhythm.',
      correctEmotion: 'Calm',
      options: [
        { label: 'Calm', description: 'Regulated and at ease', emoji: '😌' },
        { label: 'Frustrated', description: 'Tense muscles', emoji: '😤' },
        { label: 'Proud', description: 'Accomplished a task', emoji: '🌟' },
        { label: 'Overwhelmed', description: 'Sensory overload', emoji: '😣' }
      ]
    }
  ]
};

export function EmotionExplorerActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [qIndex, setQIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  const scenarioList = SCENARIOS[level];
  const currentScenario = scenarioList[qIndex];

  const resetActivity = () => {
    setQIndex(0);
    setAttempts(0);
    setErrors(0);
    setSelectedEmotion(null);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleSelectEmotion = (emotionLabel: string) => {
    setSelectedEmotion(emotionLabel);
    setAttempts(a => a + 1);

    if (emotionLabel === currentScenario.correctEmotion) {
      sensoryAudio.playSuccessTone();
      setFeedback({
        status: 'correct',
        msg: `Yes! ${emotionLabel} matches the scenario. ${currentScenario.contextHint}`
      });

      setTimeout(() => {
        if (qIndex + 1 < scenarioList.length) {
          setQIndex(q => q + 1);
          setSelectedEmotion(null);
          setFeedback({ status: 'neutral', msg: '' });
        } else {
          setIsCompleted(true);
        }
      }, 1200);
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `Let's consider: ${currentScenario.contextHint}`
      });
    }
  };

  if (isCompleted) {
    const duration = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (scenarioList.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="emotion-explorer"
        title="Emotion Explorer"
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
        title="Emotion Explorer"
        objective="Identify social and internal emotional signals to navigate feelings comfortably."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 2 Emotions',
          2: 'Level 2: 3 Emotions',
          3: 'Level 3: Complex Cues'
        }}
      />

      <InstructionPanel
        instruction="Read or listen to the scenario, then choose how they feel."
        hint={currentScenario.contextHint}
      />

      <ProgressIndicator
        current={qIndex + 1}
        total={scenarioList.length}
        label="Scenario Progress"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Main Scenario Vignette */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#DCE4DD] text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0] flex items-center justify-center text-3xl">
          <HeartHandshake className="w-8 h-8 text-[#4B6F55]" />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C241E] leading-relaxed max-w-xl mx-auto">
          &ldquo;{currentScenario.scenario}&rdquo;
        </h3>

        <p className="text-sm font-semibold text-[#B8673E]">
          Clue: {currentScenario.contextHint}
        </p>
      </div>

      {/* Emotion Options */}
      <div className={`grid grid-cols-1 sm:grid-cols-${currentScenario.options.length} gap-4`}>
        {currentScenario.options.map((opt) => {
          const isSelected = selectedEmotion === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleSelectEmotion(opt.label)}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 child-touch-target min-h-[140px] ${
                isSelected && feedback.status === 'correct'
                  ? 'bg-[#E5EDE6] border-[#4B6F55] ring-3 ring-[#4B6F55]/20'
                  : isSelected && feedback.status === 'incorrect'
                  ? 'bg-[#FCF8F3] border-[#B8673E]'
                  : 'bg-white border-[#DCE4DD] hover:border-[#4B6F55] hover:bg-[#FBF9F5]'
              }`}
            >
              <span className="text-4xl">{opt.emoji}</span>
              <span className="text-xl font-black text-[#1C241E]">{opt.label}</span>
              <span className="text-xs text-[#6B786F] font-medium">{opt.description}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
