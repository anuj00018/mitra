'use client';

import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { FeedbackPanel } from './common/FeedbackPanel';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Circle, Square, Triangle } from 'lucide-react';

interface ShapeItem {
  id: string;
  shape: 'circle' | 'square' | 'triangle';
  color: 'green' | 'terracotta' | 'blue';
  name: string;
  sorted: boolean;
}

interface TargetBin {
  id: string;
  label: string;
  shapeRequirement?: 'circle' | 'square' | 'triangle';
  colorRequirement?: 'green' | 'terracotta' | 'blue';
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const LEVEL_CONFIGS: {
  [key in DifficultyLevel]: {
    items: Omit<ShapeItem, 'sorted'>[];
    bins: TargetBin[];
    instruction: string;
  };
} = {
  1: {
    instruction: 'Sort the items by color into Green and Terracotta bins.',
    bins: [
      { id: 'b-green', label: 'Green Bin', colorRequirement: 'green', bgClass: 'bg-[#E5EDE6]', borderClass: 'border-[#4B6F55]', textClass: 'text-[#2F4535]' },
      { id: 'b-terracotta', label: 'Terracotta Bin', colorRequirement: 'terracotta', bgClass: 'bg-[#F7EEE3]', borderClass: 'border-[#B8673E]', textClass: 'text-[#9A522E]' }
    ],
    items: [
      { id: 'i1', shape: 'circle', color: 'green', name: 'Green Circle' },
      { id: 'i2', shape: 'square', color: 'terracotta', name: 'Terracotta Square' },
      { id: 'i3', shape: 'triangle', color: 'green', name: 'Green Triangle' },
      { id: 'i4', shape: 'circle', color: 'terracotta', name: 'Terracotta Circle' },
    ]
  },
  2: {
    instruction: 'Sort the items by shape: Circles, Squares, and Triangles.',
    bins: [
      { id: 'b-circle', label: 'Circles Bin', shapeRequirement: 'circle', bgClass: 'bg-[#F4F7F4]', borderClass: 'border-[#4B6F55]', textClass: 'text-[#2F4535]' },
      { id: 'b-square', label: 'Squares Bin', shapeRequirement: 'square', bgClass: 'bg-[#E1EEF5]', borderClass: 'border-[#3C6C82]', textClass: 'text-[#2C5264]' },
      { id: 'b-triangle', label: 'Triangles Bin', shapeRequirement: 'triangle', bgClass: 'bg-[#F7EEE3]', borderClass: 'border-[#B8673E]', textClass: 'text-[#9A522E]' }
    ],
    items: [
      { id: 'i1', shape: 'circle', color: 'blue', name: 'Blue Circle' },
      { id: 'i2', shape: 'square', color: 'green', name: 'Green Square' },
      { id: 'i3', shape: 'triangle', color: 'terracotta', name: 'Terracotta Triangle' },
      { id: 'i4', shape: 'circle', color: 'green', name: 'Green Circle' },
      { id: 'i5', shape: 'square', color: 'terracotta', name: 'Terracotta Square' },
      { id: 'i6', shape: 'triangle', color: 'blue', name: 'Blue Triangle' },
    ]
  },
  3: {
    instruction: 'Sort by shape and color: Match both attributes precisely.',
    bins: [
      { id: 'b-gc', label: 'Green Circles', shapeRequirement: 'circle', colorRequirement: 'green', bgClass: 'bg-[#E5EDE6]', borderClass: 'border-[#4B6F55]', textClass: 'text-[#2F4535]' },
      { id: 'b-ts', label: 'Terracotta Squares', shapeRequirement: 'square', colorRequirement: 'terracotta', bgClass: 'bg-[#F7EEE3]', borderClass: 'border-[#B8673E]', textClass: 'text-[#9A522E]' },
      { id: 'b-bt', label: 'Blue Triangles', shapeRequirement: 'triangle', colorRequirement: 'blue', bgClass: 'bg-[#E1EEF5]', borderClass: 'border-[#3C6C82]', textClass: 'text-[#2C5264]' }
    ],
    items: [
      { id: 'i1', shape: 'circle', color: 'green', name: 'Green Circle' },
      { id: 'i2', shape: 'square', color: 'terracotta', name: 'Terracotta Square' },
      { id: 'i3', shape: 'triangle', color: 'blue', name: 'Blue Triangle' },
      { id: 'i4', shape: 'circle', color: 'green', name: 'Green Circle' },
      { id: 'i5', shape: 'square', color: 'terracotta', name: 'Terracotta Square' },
      { id: 'i6', shape: 'triangle', color: 'blue', name: 'Blue Triangle' },
    ]
  }
};

export function ShapeColourSortingActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [items, setItems] = useState<ShapeItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral'; msg: string }>({
    status: 'neutral',
    msg: ''
  });

  const config = LEVEL_CONFIGS[level];

  const resetActivity = (lvl: DifficultyLevel) => {
    setItems(LEVEL_CONFIGS[lvl].items.map(i => ({ ...i, sorted: false })));
    setSelectedItemId(null);
    setAttempts(0);
    setErrors(0);
    setFeedback({ status: 'neutral', msg: '' });
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  useEffect(() => {
    resetActivity(level);
  }, [level]);

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    sensoryAudio.playSoftChime(440, 0.2);
    const item = items.find(i => i.id === id);
    if (item) {
      setFeedback({
        status: 'neutral',
        msg: `Selected ${item.name}. Tap matching bin below.`
      });
    }
  };

  const handleSelectBin = (bin: TargetBin) => {
    if (!selectedItemId) {
      sensoryAudio.playGentlePrompt();
      setFeedback({
        status: 'incorrect',
        msg: 'Please tap a shape first, then tap the bin.'
      });
      return;
    }

    const currentItem = items.find(i => i.id === selectedItemId);
    if (!currentItem) return;

    setAttempts(a => a + 1);

    // Validate requirements
    let match = true;
    if (bin.colorRequirement && currentItem.color !== bin.colorRequirement) match = false;
    if (bin.shapeRequirement && currentItem.shape !== bin.shapeRequirement) match = false;

    if (match) {
      sensoryAudio.playSuccessTone();
      const updated = items.map(i => (i.id === selectedItemId ? { ...i, sorted: true } : i));
      setItems(updated);
      setSelectedItemId(null);
      setFeedback({
        status: 'correct',
        msg: `${currentItem.name} placed safely in ${bin.label}!`
      });

      if (updated.every(i => i.sorted)) {
        setTimeout(() => setIsCompleted(true), 600);
      }
    } else {
      sensoryAudio.playGentlePrompt();
      setErrors(e => e + 1);
      setFeedback({
        status: 'incorrect',
        msg: `Check ${currentItem.name}'s properties to match the bin requirements.`
      });
    }
  };

  const renderShapeIcon = (shape: string, color: string, className = 'w-8 h-8') => {
    const colorStyle = 
      color === 'green' ? 'text-[#4B6F55] fill-[#E5EDE6]' :
      color === 'terracotta' ? 'text-[#B8673E] fill-[#F7EEE3]' :
      'text-[#3C6C82] fill-[#E1EEF5]';

    if (shape === 'circle') return <Circle className={`${className} ${colorStyle}`} />;
    if (shape === 'square') return <Square className={`${className} ${colorStyle}`} />;
    return <Triangle className={`${className} ${colorStyle}`} />;
  };

  if (isCompleted) {
    const duration = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.6, (config.items.length / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="shape-sorting"
        title="Shape & Colour Sorting"
        difficulty={level}
        durationSeconds={duration}
        attempts={attempts}
        errors={errors}
        score={score}
        accuracyRate={accuracy}
        onPlayAgain={() => resetActivity(level)}
        onNextLevel={level < 3 ? () => setLevel((level + 1) as DifficultyLevel) : undefined}
        onExit={onExit}
      />
    );
  }

  const sortedCount = items.filter(i => i.sorted).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="Shape & Colour Sorting"
        objective="Develop categorization and attribute discernment across geometric shapes and hues."
        currentLevel={level}
        onLevelChange={(lvl) => setLevel(lvl)}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 2 Colors',
          2: 'Level 2: 3 Shapes',
          3: 'Level 3: Shape + Color'
        }}
      />

      <InstructionPanel
        instruction={config.instruction}
        hint="Tap an item in the tray, then tap its destination container."
      />

      <ProgressIndicator
        current={sortedCount}
        total={items.length}
        label="Items Sorted"
      />

      {feedback.status !== 'neutral' && (
        <FeedbackPanel
          status={feedback.status}
          message={feedback.msg}
          showAction={false}
        />
      )}

      {/* Shapes Tray */}
      <div className="p-6 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-xs">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider mb-3">
          Shapes Tray (Tap to select)
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.sorted}
                onClick={() => handleSelectItem(item.id)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 child-touch-target min-w-[90px] sm:min-w-[110px] ${
                  item.sorted
                    ? 'opacity-20 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#E5EDE6] border-[#4B6F55] ring-3 ring-[#4B6F55]/20 scale-105 shadow-sm'
                    : 'bg-[#FBF9F5] border-[#DCE4DD] hover:border-[#4B6F55]'
                }`}
                aria-label={item.name}
              >
                {renderShapeIcon(item.shape, item.color, 'w-10 h-10')}
                <span className="text-xs font-bold text-[#1C241E] truncate">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Bins */}
      <div className={`grid grid-cols-1 ${config.bins.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
        {config.bins.map((bin) => (
          <button
            key={bin.id}
            type="button"
            onClick={() => handleSelectBin(bin)}
            className={`p-6 rounded-3xl border-3 ${bin.borderClass} ${bin.bgClass} hover:opacity-90 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 child-touch-target min-h-[140px] shadow-xs`}
          >
            <span className={`text-lg sm:text-xl font-black ${bin.textClass}`}>
              {bin.label}
            </span>
            <span className="text-xs text-[#48544C] font-semibold">
              Tap to place selected item here
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
