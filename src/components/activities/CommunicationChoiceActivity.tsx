'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { useApp } from '@/lib/store';
import { Volume2, Sparkles, GlassWater, Palette, Hand, Heart, Footprints } from 'lucide-react';

interface CommunicationCard {
  id: string;
  category: 'prefix' | 'action' | 'object' | 'state';
  label: string;
  speechText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AAC_CONFIGS: {
  [key in DifficultyLevel]: {
    taskPrompt: string;
    stripTemplate: string[];
    requiredSlots: number;
    options: CommunicationCard[];
  };
} = {
  1: {
    taskPrompt: 'Express a request: Choose what you want right now.',
    stripTemplate: ['I Want', 'Choice'],
    requiredSlots: 2,
    options: [
      { id: 'water', category: 'object', label: 'Water', speechText: 'I want water, please.', icon: GlassWater },
      { id: 'break', category: 'object', label: 'Quiet Break', speechText: 'I want a quiet break, please.', icon: Sparkles },
      { id: 'help', category: 'object', label: 'Help', speechText: 'I want some help, please.', icon: Hand },
      { id: 'draw', category: 'object', label: 'Drawing', speechText: 'I want to draw, please.', icon: Palette },
    ]
  },
  2: {
    taskPrompt: 'Build a 3-word communication strip to express your need.',
    stripTemplate: ['I Want', 'Action', 'Target'],
    requiredSlots: 3,
    options: [
      { id: 'to-drink', category: 'action', label: 'To Drink', speechText: 'to drink', icon: GlassWater },
      { id: 'to-rest', category: 'action', label: 'To Rest', speechText: 'to rest', icon: Sparkles },
      { id: 'to-walk', category: 'action', label: 'To Walk', speechText: 'to walk', icon: Footprints },
      { id: 'cold-water', category: 'object', label: 'Cold Water', speechText: 'cold water', icon: GlassWater },
      { id: 'soft-pillow', category: 'object', label: 'Soft Pillow', speechText: 'a soft pillow', icon: Sparkles },
      { id: 'green-garden', category: 'object', label: 'In the Garden', speechText: 'in the garden', icon: Footprints },
    ]
  },
  3: {
    taskPrompt: 'Express both your body feeling and your calming need.',
    stripTemplate: ['I Feel', 'Emotion', 'I Need', 'Calm Tool'],
    requiredSlots: 4,
    options: [
      { id: 'feel-overwhelmed', category: 'state', label: 'Overwhelmed', speechText: 'I feel overwhelmed.', icon: Heart },
      { id: 'feel-tired', category: 'state', label: 'Tired', speechText: 'I feel tired.', icon: Sparkles },
      { id: 'feel-ready', category: 'state', label: 'Calm & Ready', speechText: 'I feel calm and ready.', icon: Heart },
      { id: 'need-quiet', category: 'object', label: 'Quiet Space', speechText: 'I need quiet space.', icon: Sparkles },
      { id: 'need-headphones', category: 'object', label: 'Headphones', speechText: 'I need headphones.', icon: Sparkles },
      { id: 'need-hug', category: 'object', label: 'Gentle Comfort', speechText: 'I need gentle comfort.', icon: Heart },
    ]
  }
};

export function CommunicationChoiceActivity({ onExit }: { onExit: () => void }) {
  const { activeChild } = useApp();
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [selectedCards, setSelectedCards] = useState<CommunicationCard[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  const aac = AAC_CONFIGS[level];

  const resetActivity = () => {
    setSelectedCards([]);
    setAttempts(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const handleCardClick = (card: CommunicationCard) => {
    if (selectedCards.some(c => c.id === card.id)) return;

    sensoryAudio.playSoftChime(523.25, 0.2);
    sensoryAudio.speakInstruction(card.label, activeChild.sensoryPreferences.voiceSpeed);

    const updated = [...selectedCards, card];
    setSelectedCards(updated);
    setAttempts(a => a + 1);

    if (updated.length >= (level === 1 ? 1 : level === 2 ? 2 : 2)) {
      setFeedback({
        status: 'correct',
        msg: 'Sentence strip ready! Tap "Speak My Choice" to share.'
      });
    }
  };

  const handleSpeakSentence = () => {
    let fullPhrase = '';
    if (level === 1 && selectedCards.length > 0) {
      fullPhrase = `I want ${selectedCards[0].label}, please.`;
    } else if (level === 2 && selectedCards.length >= 2) {
      fullPhrase = `I want ${selectedCards[0].label} ${selectedCards[1].label}.`;
    } else if (level === 3 && selectedCards.length >= 2) {
      fullPhrase = `I feel ${selectedCards[0].label}. I need ${selectedCards[1].label}.`;
    } else {
      fullPhrase = selectedCards.map(c => c.label).join(' ');
    }

    sensoryAudio.playSuccessTone();
    sensoryAudio.speakInstruction(fullPhrase, activeChild.sensoryPreferences.voiceSpeed, () => {
      setTimeout(() => setIsCompleted(true), 600);
    });
  };

  const handleClearStrip = () => {
    setSelectedCards([]);
    setFeedback({ status: 'neutral', msg: '' });
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = 1.0;
    const score = 100;

    return (
      <CompletionScreen
        activityId="communication-choice"
        title="Communication Choice"
        difficulty={level}
        durationSeconds={duration}
        attempts={attempts}
        errors={0}
        score={score}
        accuracyRate={accuracy}
        onPlayAgain={() => resetActivity()}
        onNextLevel={level < 3 ? () => { const nextLvl = (level + 1) as DifficultyLevel; setLevel(nextLvl); resetActivity(); } : undefined}
        onExit={onExit}
      />
    );
  }

  const isStripReady = selectedCards.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="Communication Choice (AAC Board)"
        objective="Empower expressive communication by assembling functional picture request strips."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 1 Request',
          2: 'Level 2: Action + Object',
          3: 'Level 3: Feeling + Need'
        }}
      />

      <InstructionPanel
        instruction={aac.taskPrompt}
        hint="Tap the cards below to build your sentence strip."
      />

      <ProgressIndicator
        current={selectedCards.length}
        total={level === 1 ? 1 : 2}
        label="Words in Strip"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* AAC Sentence Strip Display */}
      <div className="p-6 rounded-3xl bg-white border-3 border-[#4B6F55] shadow-xs">
        <p className="text-xs font-bold text-[#4B6F55] uppercase tracking-wider mb-3">
          Your Sentence Strip (AAC)
        </p>

        <div className="flex flex-wrap items-center gap-3 min-h-[90px] p-3 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0]">
          {/* Starting Core Word */}
          <div className="px-4 py-3 rounded-xl bg-[#E5EDE6] text-[#2F4535] font-extrabold text-lg sm:text-xl border border-[#C7D9CA] shadow-2xs">
            {level === 3 ? 'I Feel / I Need' : 'I Want'}
          </div>

          {selectedCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#4B6F55] flex items-center gap-2 font-bold text-base sm:text-lg text-[#1C241E] shadow-2xs animate-scale-in"
              >
                <Icon className="w-5 h-5 text-[#4B6F55]" />
                <span>{card.label}</span>
              </div>
            );
          })}

          {selectedCards.length === 0 && (
            <span className="text-xs sm:text-sm text-[#6B786F] italic ml-2">
              (Tap a card below to add to your sentence)
            </span>
          )}
        </div>

        {/* Action Controls for Strip */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={handleClearStrip}
            disabled={selectedCards.length === 0}
            className="px-4 py-2 text-xs font-bold rounded-xl text-[#48544C] hover:bg-[#F3EFE6] disabled:opacity-40"
          >
            Clear Strip
          </button>

          <button
            type="button"
            disabled={!isStripReady}
            onClick={handleSpeakSentence}
            className="child-touch-target px-6 py-3 rounded-2xl bg-[#4B6F55] hover:bg-[#3D5A45] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-base flex items-center gap-2 shadow-xs transition-all"
          >
            <Volume2 className="w-5 h-5" />
            <span>Speak My Choice</span>
          </button>
        </div>
      </div>

      {/* AAC Vocabulary Board */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider text-center">
          Tap to Select Vocabulary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {aac.options.map((card) => {
            const isSelected = selectedCards.some(c => c.id === card.id);
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                disabled={isSelected}
                onClick={() => handleCardClick(card)}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 child-touch-target min-h-[130px] ${
                  isSelected
                    ? 'bg-gray-100 border-gray-200 opacity-40 cursor-default'
                    : 'bg-white border-[#DCE4DD] hover:border-[#4B6F55] active:scale-95 shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F4F7F4] text-[#2F4535] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base font-bold text-[#1C241E]">
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
