'use client';

import React, { useState } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Volume2, Bell, Drum, Bird, CloudRain, Music, Waves } from 'lucide-react';

interface SoundOption {
  id: string;
  name: string;
  description: string;
  frequency: number;
  duration: number;
  icon: React.ComponentType<{ className?: string }>;
}

const SOUND_SETS: { [key in DifficultyLevel]: { sounds: SoundOption[]; rounds: string[] } } = {
  1: {
    sounds: [
      { id: 'high-bell', name: 'High Crystal Chime', description: 'Bright, light tone like a silver bell.', frequency: 784, duration: 0.5, icon: Bell },
      { id: 'low-drum', name: 'Low Warm Drum', description: 'Deep, soft grounding pulse.', frequency: 220, duration: 0.6, icon: Drum }
    ],
    rounds: ['high-bell', 'low-drum', 'high-bell']
  },
  2: {
    sounds: [
      { id: 'bird', name: 'Singing Bird', description: 'Sweet playful high melody.', frequency: 659, duration: 0.4, icon: Bird },
      { id: 'flute', name: 'Gentle Wood Flute', description: 'Smooth, warm breath tone.', frequency: 440, duration: 0.5, icon: Music },
      { id: 'rain', name: 'Rain Droplets', description: 'Crisp water note.', frequency: 523, duration: 0.35, icon: CloudRain }
    ],
    rounds: ['bird', 'rain', 'flute']
  },
  3: {
    sounds: [
      { id: 'bird', name: 'Singing Bird', description: 'Sweet high chirp.', frequency: 659, duration: 0.4, icon: Bird },
      { id: 'ocean', name: 'Ocean Waves Chime', description: 'Flowing harmonic tone.', frequency: 349, duration: 0.6, icon: Waves },
      { id: 'bell', name: 'Temple Bell', description: 'Resonant bronze sound.', frequency: 587, duration: 0.55, icon: Bell },
      { id: 'drum', name: 'Low Warm Drum', description: 'Grounding rhythm pulse.', frequency: 196, duration: 0.65, icon: Drum }
    ],
    rounds: ['ocean', 'bell', 'drum', 'bird']
  }
};

export function SoundMatchActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [roundIdx, setRoundIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  const soundSet = SOUND_SETS[level];
  const targetId = soundSet.rounds[roundIdx];
  const targetSound = soundSet.sounds.find(s => s.id === targetId)!;

  const resetActivity = () => {
    setRoundIdx(0);
    setAttempts(0);
    setErrors(0);
    setHasPlayed(false);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  const playTargetSound = () => {
    sensoryAudio.playSoftChime(targetSound.frequency, targetSound.duration);
    setHasPlayed(true);
  };

  const handleSelectSound = (sound: SoundOption) => {
    if (!hasPlayed) {
      sensoryAudio.playGentlePrompt();
      setFeedback({
        status: 'incorrect',
        msg: 'Please press the big "Listen" button first to hear the sound.'
      });
      return;
    }

    setAttempts(a => a + 1);

    if (sound.id === targetId) {
      sensoryAudio.playSuccessTone();
      setFeedback({
        status: 'correct',
        msg: `Match! You recognized the sound of ${sound.name}.`
      });

      setTimeout(() => {
        if (roundIdx + 1 < soundSet.rounds.length) {
          setRoundIdx(r => r + 1);
          setHasPlayed(false);
          setFeedback({ status: 'neutral', msg: '' });
        } else {
          setIsCompleted(true);
        }
      }, 1000);
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      // Play option sound so child can compare
      sensoryAudio.playSoftChime(sound.frequency, sound.duration);
      setFeedback({
        status: 'incorrect',
        msg: `That sound is ${sound.name}. Listen to the mystery sound again to compare.`
      });
    }
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (soundSet.rounds.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="sound-match"
        title="Sound Match"
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
        title="Sound Match"
        objective="Refine auditory discrimination and acoustic memory by pairing tones with visual sources."
        currentLevel={level}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          resetActivity();
        }}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: High vs Low',
          2: 'Level 2: 3 Melodies',
          3: 'Level 3: 4 Soundscapes'
        }}
      />

      <InstructionPanel
        instruction="Press the big speaker button to listen, then tap the picture that matches the sound."
        hint="Listen with calm ears. Is it high or deep?"
      />

      <ProgressIndicator
        current={roundIdx + 1}
        total={soundSet.rounds.length}
        label="Sound Challenge"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Central Big Speaker Button */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#DCE4DD] text-center shadow-xs">
        <button
          type="button"
          onClick={playTargetSound}
          className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#E5EDE6] border-3 border-[#4B6F55] hover:bg-[#D5E5D8] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 shadow-sm child-touch-target"
          aria-label="Play mystery sound to match"
        >
          <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#2F4535]" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2F4535]">
            Play Tone
          </span>
        </button>
        <p className="text-xs sm:text-sm font-semibold text-[#48544C] mt-3">
          {hasPlayed ? 'Sound played! Now choose the matching card below.' : 'Tap speaker to hear the tone.'}
        </p>
      </div>

      {/* Visual Matching Options */}
      <div className={`grid grid-cols-1 sm:grid-cols-${soundSet.sounds.length} gap-4`}>
        {soundSet.sounds.map((sound) => {
          const Icon = sound.icon;
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => handleSelectSound(sound)}
              className="p-6 rounded-3xl bg-white border-2 border-[#DCE4DD] hover:border-[#4B6F55] active:scale-95 transition-all flex flex-col items-center justify-center text-center gap-3 child-touch-target shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0] flex items-center justify-center text-[#4B6F55]">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-[#1C241E]">{sound.name}</h4>
                <p className="text-xs text-[#6B786F] mt-0.5">{sound.description}</p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
