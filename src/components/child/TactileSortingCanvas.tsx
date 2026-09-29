'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface SortingItem {
  id: string;
  name: string;
  emoji: string;
  category: 'green' | 'amber' | 'blue';
  sorted: boolean;
}

const INITIAL_ITEMS: SortingItem[] = [
  { id: 'item-1', name: 'Green Leaf', emoji: '🍃', category: 'green', sorted: false },
  { id: 'item-2', name: 'Golden Sun', emoji: '☀️', category: 'amber', sorted: false },
  { id: 'item-3', name: 'Blue Droplet', emoji: '💧', category: 'blue', sorted: false },
  { id: 'item-4', name: 'Green Clover', emoji: '☘️', category: 'green', sorted: false },
  { id: 'item-5', name: 'Amber Star', emoji: '⭐', category: 'amber', sorted: false },
  { id: 'item-6', name: 'Blue Cloud', emoji: '☁️', category: 'blue', sorted: false },
];

export function TactileSortingCanvas({ onExit }: { onExit: () => void }) {
  const { activeChild, logSession } = useApp();
  const [items, setItems] = useState<SortingItem[]>(INITIAL_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const remainingItems = items.filter(i => !i.sorted);
  const activeSelectedItem = items.find(i => i.id === selectedItemId);

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    sensoryAudio.playSoftChime(440, 0.2);
    const item = items.find(i => i.id === id);
    if (item) {
      sensoryAudio.speakInstruction(`Selected ${item.name}. Now choose matching basket.`, activeChild.sensoryPreferences.voiceSpeed);
    }
  };

  const handleChooseBasket = (category: 'green' | 'amber' | 'blue') => {
    if (!selectedItemId) {
      sensoryAudio.speakInstruction('Please tap a shape first.', activeChild.sensoryPreferences.voiceSpeed);
      return;
    }

    const current = items.find(i => i.id === selectedItemId);
    if (!current) return;

    if (current.category === category) {
      sensoryAudio.playSuccessTone();
      const updated = items.map(i => (i.id === selectedItemId ? { ...i, sorted: true } : i));
      setItems(updated);
      setSelectedItemId(null);

      const allDone = updated.every(i => i.sorted);
      if (allDone) {
        setIsFinished(true);
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.6 },
            colors: ['#4B6F55', '#B8673E', '#3C6C82']
          });
        } catch {}

        const duration = Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
        logSession({
          childId: activeChild.id,
          activityId: 'calm-sorting',
          activityTitle: 'Calm Color Sorting',
          durationSeconds: duration,
          completed: true,
          promptsNeeded: mistakes,
          accuracyRate: mistakes === 0 ? 1.0 : 0.88,
          sensoryFatigueFlag: false,
          childMood: 'focused'
        });
      }
    } else {
      setMistakes(m => m + 1);
      sensoryAudio.playGentlePrompt();
      sensoryAudio.speakInstruction(`Let's look at the color again.`, activeChild.sensoryPreferences.voiceSpeed);
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-md space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center text-5xl">
            🏆
          </div>
          <h2 className="text-3xl font-extrabold text-[#1C241E]">
            All Shapes Safely Sorted!
          </h2>
          <p className="text-lg text-[#48544C]">
            Every shape found its quiet matching home.
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
                setItems(INITIAL_ITEMS.map(i => ({ ...i, sorted: false })));
                setSelectedItemId(null);
                setIsFinished(false);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#F3EFE6] text-[#1C241E] font-semibold text-base hover:bg-[#E8E2D5]"
            >
              Sort Again
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
          {remainingItems.length} Shapes Remaining
        </span>
      </div>

      {/* Instruction */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-[#DCE4DD] flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#1C241E]">
            {activeSelectedItem ? `Match "${activeSelectedItem.name}" to its basket below:` : 'Tap any shape below to select it:'}
          </h3>
          <p className="text-xs text-[#6B786F]">Take your time; there is no timer.</p>
        </div>
        <button
          onClick={() => sensoryAudio.speakInstruction(
            activeSelectedItem ? `Match ${activeSelectedItem.name} to its matching colored basket.` : 'Tap any shape to begin matching.',
            activeChild.sensoryPreferences.voiceSpeed
          )}
          className="p-2 rounded-xl bg-[#F4F7F4] text-[#4B6F55]"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Shapes Tray */}
      <div className="p-6 rounded-3xl bg-white border-2 border-[#DCE4DD] mb-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.sorted}
              onClick={() => handleSelectItem(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                item.sorted
                  ? 'opacity-20 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : selectedItemId === item.id
                  ? 'bg-[#E5EDE6] border-[#4B6F55] ring-4 ring-[#4B6F55]/20 scale-105 shadow-md'
                  : 'bg-[#FBF9F5] border-[#E2DBD0] hover:border-[#4B6F55]'
              }`}
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="text-[11px] font-bold text-[#48544C] truncate w-full text-center">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Matching Calm Baskets (Large Touch Target Zones) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* GREEN BASKET */}
        <button
          onClick={() => handleChooseBasket('green')}
          className="p-6 rounded-3xl bg-[#E5EDE6] border-3 border-[#4B6F55] hover:bg-[#D5E5D8] transition-all text-center flex flex-col items-center gap-2 child-touch-target min-h-[140px]"
        >
          <span className="text-3xl">🌿</span>
          <span className="text-xl font-black text-[#2F4535]">Green Meadow</span>
          <span className="text-xs text-[#4B6F55] font-semibold">
            {items.filter(i => i.category === 'green' && i.sorted).length} of 2 sorted
          </span>
        </button>

        {/* AMBER BASKET */}
        <button
          onClick={() => handleChooseBasket('amber')}
          className="p-6 rounded-3xl bg-[#F7EEE3] border-3 border-[#B8673E] hover:bg-[#F2E4D2] transition-all text-center flex flex-col items-center gap-2 child-touch-target min-h-[140px]"
        >
          <span className="text-3xl">☀️</span>
          <span className="text-xl font-black text-[#9A522E]">Warm Sunlight</span>
          <span className="text-xs text-[#B8673E] font-semibold">
            {items.filter(i => i.category === 'amber' && i.sorted).length} of 2 sorted
          </span>
        </button>

        {/* BLUE BASKET */}
        <button
          onClick={() => handleChooseBasket('blue')}
          className="p-6 rounded-3xl bg-[#E1EEF5] border-3 border-[#3C6C82] hover:bg-[#D0E5F0] transition-all text-center flex flex-col items-center gap-2 child-touch-target min-h-[140px]"
        >
          <span className="text-3xl">💧</span>
          <span className="text-xl font-black text-[#2C5264]">Gentle Stream</span>
          <span className="text-xs text-[#3C6C82] font-semibold">
            {items.filter(i => i.category === 'blue' && i.sorted).length} of 2 sorted
          </span>
        </button>

      </div>

    </div>
  );
}
