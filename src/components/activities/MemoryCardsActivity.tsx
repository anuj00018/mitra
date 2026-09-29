'use client';

import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '@/types/activity';
import { ActivityHeader } from './common/ActivityHeader';
import { InstructionPanel } from './common/InstructionPanel';
import { ProgressIndicator } from './common/ProgressIndicator';
import { CompletionScreen } from './common/CompletionScreen';
import { sensoryAudio } from '@/lib/audio';
import { Sun, Trees, Leaf, Flower, Star, CloudRain } from 'lucide-react';

interface CardItem {
  uid: string;
  symbolId: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SYMBOL_CATALOG = [
  { symbolId: 'sun', name: 'Golden Sun', icon: Sun },
  { symbolId: 'tree', name: 'Pine Tree', icon: Trees },
  { symbolId: 'leaf', name: 'Green Leaf', icon: Leaf },
  { symbolId: 'flower', name: 'Daisy Flower', icon: Flower },
  { symbolId: 'star', name: 'Calm Star', icon: Star },
  { symbolId: 'rain', name: 'Rain Cloud', icon: CloudRain }
];

export function MemoryCardsActivity({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [deck, setDeck] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedUids, setMatchedUids] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card pair count per level: L1=2 pairs (4 cards), L2=3 pairs (6 cards), L3=4 pairs (8 cards)
  const pairCount = level === 1 ? 2 : level === 2 ? 3 : 4;

  const initDeck = (lvl: DifficultyLevel) => {
    const count = lvl === 1 ? 2 : lvl === 2 ? 3 : 4;
    const selectedSymbols = SYMBOL_CATALOG.slice(0, count);
    const combined: CardItem[] = [];

    selectedSymbols.forEach((sym) => {
      combined.push({
        uid: `${sym.symbolId}-a`,
        symbolId: sym.symbolId,
        name: sym.name,
        icon: sym.icon
      });
      combined.push({
        uid: `${sym.symbolId}-b`,
        symbolId: sym.symbolId,
        name: sym.name,
        icon: sym.icon
      });
    });

    // Deterministic shuffle
    const shuffled = combined.sort(() => Math.sin(combined.length) - 0.5);
    setDeck(shuffled);
    setFlippedUids([]);
    setMatchedUids([]);
    setAttempts(0);
    setErrors(0);
    setStartTime(Date.now());
    setIsCompleted(false);
    setIsProcessing(false);
  };

  useEffect(() => {
    initDeck(level);
  }, [level]);

  const handleCardClick = (card: CardItem) => {
    if (isProcessing) return;
    if (flippedUids.includes(card.uid) || matchedUids.includes(card.uid)) return;

    sensoryAudio.playSoftChime(440, 0.15);

    if (flippedUids.length === 0) {
      // First card flipped
      setFlippedUids([card.uid]);
    } else if (flippedUids.length === 1) {
      // Second card flipped
      const firstUid = flippedUids[0];
      const firstCard = deck.find(c => c.uid === firstUid);
      const newFlipped = [firstUid, card.uid];
      setFlippedUids(newFlipped);
      setAttempts(a => a + 1);

      if (firstCard && firstCard.symbolId === card.symbolId) {
        // MATCH!
        sensoryAudio.playSuccessTone();
        const nextMatched = [...matchedUids, firstUid, card.uid];
        setMatchedUids(nextMatched);
        setFlippedUids([]);

        if (nextMatched.length === deck.length) {
          setTimeout(() => setIsCompleted(true), 600);
        }
      } else {
        // NO MATCH -> pause and flip back softly
        setIsProcessing(true);
        setErrors(e => e + 1);
        sensoryAudio.playGentlePrompt();

        setTimeout(() => {
          setFlippedUids([]);
          setIsProcessing(false);
        }, 1100);
      }
    }
  };

  if (isCompleted) {
    const duration = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const accuracy = attempts > 0 ? Math.max(0.5, (pairCount / attempts)) : 1.0;
    const score = Math.round(accuracy * 100);

    return (
      <CompletionScreen
        activityId="memory-cards"
        title="Memory Cards"
        difficulty={level}
        durationSeconds={duration}
        attempts={attempts}
        errors={errors}
        score={score}
        accuracyRate={accuracy}
        onPlayAgain={() => initDeck(level)}
        onNextLevel={level < 3 ? () => setLevel((level + 1) as DifficultyLevel) : undefined}
        onExit={onExit}
      />
    );
  }

  const gridColsClass = level === 1 ? 'grid-cols-2 max-w-sm' : level === 2 ? 'grid-cols-3 max-w-md' : 'grid-cols-4 max-w-xl';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <ActivityHeader
        title="Memory Cards"
        objective="Strengthen visual working memory and mental mapping through gentle card recall."
        currentLevel={level}
        onLevelChange={(lvl) => setLevel(lvl)}
        onExit={onExit}
        levelLabels={{
          1: 'Level 1: 4 Cards',
          2: 'Level 2: 6 Cards',
          3: 'Level 3: 8 Cards'
        }}
      />

      <InstructionPanel
        instruction="Tap two cards to find matching picture pairs."
        hint="Remember where each picture is when cards flip back."
      />

      <ProgressIndicator
        current={matchedUids.length / 2}
        total={pairCount}
        label="Matched Pairs"
      />

      {/* Cards Grid */}
      <div className={`grid ${gridColsClass} gap-3 sm:gap-4 mx-auto pt-4`}>
        {deck.map((card) => {
          const isFlipped = flippedUids.includes(card.uid) || matchedUids.includes(card.uid);
          const isMatched = matchedUids.includes(card.uid);
          const Icon = card.icon;

          return (
            <button
              key={card.uid}
              type="button"
              disabled={isMatched || isProcessing}
              onClick={() => handleCardClick(card)}
              className={`aspect-square rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-3 sm:p-4 child-touch-target ${
                isMatched
                  ? 'bg-[#E5EDE6] border-[#4B6F55] shadow-2xs cursor-default opacity-85'
                  : isFlipped
                  ? 'bg-white border-[#4B6F55] shadow-md ring-2 ring-[#4B6F55]/20 scale-[1.02]'
                  : 'bg-[#FBF9F5] border-[#DCE4DD] hover:border-[#4B6F55] shadow-xs active:scale-95'
              }`}
              aria-label={isFlipped ? card.name : 'Hidden card, tap to flip'}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center justify-center gap-1.5 animate-scale-in">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F7F4] text-[#2F4535] flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-[#1C241E] text-center leading-tight truncate max-w-full">
                    {card.name}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-[#E8E2D5]/70 border border-[#DCE4DD] flex items-center justify-center text-sm font-black text-[#6B786F]">
                  ?
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
