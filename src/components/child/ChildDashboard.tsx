'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  Smile, 
  Heart, 
  Volume2, 
  Shapes, 
  Layers, 
  Grid, 
  BookOpen, 
  Eye, 
  ArrowRight, 
  Calendar, 
  Music, 
  MessageSquare, 
  Package, 
  ShieldCheck,
  Wind
} from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';

// Activity Components
import { ObjectMatchingActivity } from '@/components/activities/ObjectMatchingActivity';
import { MemoryCardsActivity } from '@/components/activities/MemoryCardsActivity';
import { ShapeColourSortingActivity } from '@/components/activities/ShapeColourSortingActivity';
import { StorySequencingActivity } from '@/components/activities/StorySequencingActivity';
import { EmotionExplorerActivity } from '@/components/activities/EmotionExplorerActivity';
import { FindDifferenceActivity } from '@/components/activities/FindDifferenceActivity';
import { WhatComesNextActivity } from '@/components/activities/WhatComesNextActivity';
import { DailyRoutineBuilderActivity } from '@/components/activities/DailyRoutineBuilderActivity';
import { SoundMatchActivity } from '@/components/activities/SoundMatchActivity';
import { CommunicationChoiceActivity } from '@/components/activities/CommunicationChoiceActivity';
import { EverydayObjectsActivity } from '@/components/activities/EverydayObjectsActivity';
import { SafeOrUnsafeActivity } from '@/components/activities/SafeOrUnsafeActivity';
import { CalmBreathingSphere } from '@/components/child/CalmBreathingSphere';

interface ActivityCardMeta {
  id: string;
  title: string;
  category: 'all' | 'cognitive' | 'feelings' | 'routines' | 'communication';
  instruction: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  text: string;
  border: string;
  badge: string;
}

const ACTIVITIES_LIST: ActivityCardMeta[] = [
  {
    id: 'object-matching',
    title: '1. Object Matching',
    category: 'cognitive',
    instruction: 'Find objects that belong together (Key & Lock, Toothbrush & Toothpaste).',
    icon: Layers,
    bg: 'bg-[#E5EDE6]',
    text: 'text-[#2F4535]',
    border: 'border-[#C7D9CA]',
    badge: 'Pairs & Relations'
  },
  {
    id: 'memory-cards',
    title: '2. Memory Cards',
    category: 'cognitive',
    instruction: 'Flip quiet picture cards to uncover matching pairs.',
    icon: Grid,
    bg: 'bg-[#F7EEE3]',
    text: 'text-[#9A522E]',
    border: 'border-[#E2DBD0]',
    badge: 'Visual Memory'
  },
  {
    id: 'shape-sorting',
    title: '3. Shape & Colour Sorting',
    category: 'cognitive',
    instruction: 'Sort circles, squares, and triangles into matching color bins.',
    icon: Shapes,
    bg: 'bg-[#E1EEF5]',
    text: 'text-[#2C5264]',
    border: 'border-[#C4BAAB]',
    badge: 'Classification'
  },
  {
    id: 'story-sequencing',
    title: '4. Story Sequencing',
    category: 'feelings',
    instruction: 'Put peaceful narrative pictures in order: First, Next, and Last.',
    icon: BookOpen,
    bg: 'bg-[#F4F7F4]',
    text: 'text-[#3D5A45]',
    border: 'border-[#C7D9CA]',
    badge: 'Chronological'
  },
  {
    id: 'emotion-explorer',
    title: '5. Emotion Explorer',
    category: 'feelings',
    instruction: 'Explore friendly character faces and learn subtle social feeling cues.',
    icon: Smile,
    bg: 'bg-[#E5EDE6]',
    text: 'text-[#2F4535]',
    border: 'border-[#C7D9CA]',
    badge: 'Social-Emotional'
  },
  {
    id: 'find-difference',
    title: '6. Find the Difference',
    category: 'cognitive',
    instruction: 'Look closely at quiet details to spot the object that is turned or colored differently.',
    icon: Eye,
    bg: 'bg-[#F7EEE3]',
    text: 'text-[#9A522E]',
    border: 'border-[#E2DBD0]',
    badge: 'Visual Attention'
  },
  {
    id: 'what-comes-next',
    title: '7. What Comes Next?',
    category: 'cognitive',
    instruction: 'Discover repeating patterns and deduce the missing piece.',
    icon: ArrowRight,
    bg: 'bg-[#E1EEF5]',
    text: 'text-[#2C5264]',
    border: 'border-[#C4BAAB]',
    badge: 'Pattern Logic'
  },
  {
    id: 'routine-builder',
    title: '8. Daily Routine Builder',
    category: 'routines',
    instruction: 'Assemble morning wake-up and school departure schedules step by step.',
    icon: Calendar,
    bg: 'bg-[#F4F7F4]',
    text: 'text-[#3D5A45]',
    border: 'border-[#C7D9CA]',
    badge: 'Self-Care Routine'
  },
  {
    id: 'sound-match',
    title: '9. Sound Match',
    category: 'communication',
    instruction: 'Listen to pure acoustic chimes and pair them with visual instruments.',
    icon: Music,
    bg: 'bg-[#E5EDE6]',
    text: 'text-[#2F4535]',
    border: 'border-[#C7D9CA]',
    badge: 'Auditory Processing'
  },
  {
    id: 'communication-choice',
    title: '10. Communication Choice',
    category: 'communication',
    instruction: 'Assemble spoken sentence request strips on an accessible AAC board.',
    icon: MessageSquare,
    bg: 'bg-[#F7EEE3]',
    text: 'text-[#9A522E]',
    border: 'border-[#E2DBD0]',
    badge: 'AAC Board'
  },
  {
    id: 'everyday-objects',
    title: '11. Everyday Objects',
    category: 'routines',
    instruction: 'Categorize familiar household objects into kitchen, bedroom, and bathroom spaces.',
    icon: Package,
    bg: 'bg-[#E1EEF5]',
    text: 'text-[#2C5264]',
    border: 'border-[#C4BAAB]',
    badge: 'Home Knowledge'
  },
  {
    id: 'safe-unsafe',
    title: '12. Safe or Unsafe?',
    category: 'routines',
    instruction: 'Practice identifying safe actions and recognizing when to ask an adult.',
    icon: ShieldCheck,
    bg: 'bg-[#F4F7F4]',
    text: 'text-[#3D5A45]',
    border: 'border-[#C7D9CA]',
    badge: 'Body & Safety'
  }
];

export function ChildDashboard() {
  const { activeChild, activeActivityId, setActiveActivityId } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cognitive' | 'feelings' | 'routines' | 'communication'>('all');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleLaunchActivity = (id: string, title: string) => {
    sensoryAudio.playSoftChime(523.25, 0.25);
    sensoryAudio.speakInstruction(`Starting ${title}`, activeChild.sensoryPreferences.voiceSpeed);
    setActiveActivityId(id);
  };

  const handleMoodSelect = (mood: string, label: string) => {
    setSelectedMood(mood);
    sensoryAudio.playSoftChime(440, 0.2);
    sensoryAudio.speakInstruction(`You feel ${label}. Thank you for sharing.`, activeChild.sensoryPreferences.voiceSpeed);
  };

  // Activity Switcher
  if (activeActivityId === 'object-matching') return <ObjectMatchingActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'memory-cards') return <MemoryCardsActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'shape-sorting') return <ShapeColourSortingActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'story-sequencing') return <StorySequencingActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'emotion-explorer') return <EmotionExplorerActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'find-difference') return <FindDifferenceActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'what-comes-next') return <WhatComesNextActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'routine-builder') return <DailyRoutineBuilderActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'sound-match') return <SoundMatchActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'communication-choice') return <CommunicationChoiceActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'everyday-objects') return <EverydayObjectsActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'safe-unsafe') return <SafeOrUnsafeActivity onExit={() => setActiveActivityId(null)} />;
  if (activeActivityId === 'sensory-sphere') return <CalmBreathingSphere onExit={() => setActiveActivityId(null)} />;

  const filteredActivities = selectedCategory === 'all'
    ? ACTIVITIES_LIST
    : ACTIVITIES_LIST.filter(a => a.category === selectedCategory);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Friendly Child Greeting Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#E5EDE6] border-2 border-[#C7D9CA] flex items-center justify-center text-4xl shadow-xs">
            {activeChild.avatarKey === 'fox' && '🦊'}
            {activeChild.avatarKey === 'owl' && '🦉'}
            {activeChild.avatarKey === 'koala' && '🐨'}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C241E] tracking-tight">
                Hello, {activeChild.displayName}!
              </h1>
              <button
                type="button"
                onClick={() => sensoryAudio.speakInstruction(`Hello ${activeChild.displayName}! What activity shall we explore today?`, activeChild.sensoryPreferences.voiceSpeed)}
                className="p-2 rounded-xl bg-[#F4F7F4] text-[#4B6F55] hover:bg-[#E5EDE6] transition-colors"
                aria-label="Read greeting aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-[#48544C] mt-1 font-medium">
              Choose an activity below to explore and learn at your own calm pace.
            </p>
          </div>
        </div>

        {/* Calm Corner Shortcut */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveActivityId('sensory-sphere')}
            className="px-5 py-3 rounded-2xl bg-[#E5EDE6] border-2 border-[#4B6F55] text-[#2F4535] hover:bg-[#D5E5D8] text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-2xs transition-all child-touch-target"
          >
            <Wind className="w-5 h-5 text-[#4B6F55]" />
            <span>Calm Breathing Space</span>
          </button>
        </div>
      </div>

      {/* Mood Check-In Bar */}
      <div className="p-5 rounded-3xl bg-white/70 border border-[#E2DBD0]">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm sm:text-base font-bold text-[#1C241E] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#B8673E]" />
            How does your body feel today?
          </span>
          <span className="text-xs text-[#6B786F]">Tap to share</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'calm', label: 'Calm & Ready', emoji: '🌿', color: 'hover:bg-[#E5EDE6]' },
            { id: 'happy', label: 'Happy & Excited', emoji: '☀️', color: 'hover:bg-[#F7EEE3]' },
            { id: 'tired', label: 'Need Quiet Time', emoji: '☁️', color: 'hover:bg-[#E1EEF5]' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleMoodSelect(m.id, m.label)}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                selectedMood === m.id
                  ? 'bg-[#E5EDE6] border-[#4B6F55] ring-2 ring-[#4B6F55]'
                  : `bg-white border-[#E2DBD0] ${m.color}`
              }`}
            >
              <span className="text-2xl sm:text-3xl">{m.emoji}</span>
              <span className="text-xs sm:text-sm font-bold text-[#1C241E]">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F3EFE6] border border-[#E2DBD0] rounded-2xl overflow-x-auto">
        {[
          { id: 'all' as const, label: 'All 12 Activities' },
          { id: 'cognitive' as const, label: 'Cognitive & Patterns' },
          { id: 'feelings' as const, label: 'Feelings & Stories' },
          { id: 'routines' as const, label: 'Routines & Safety' },
          { id: 'communication' as const, label: 'Communication & Sound' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-[#1C241E] shadow-2xs border border-[#DCE4DD]'
                  : 'text-[#48544C] hover:text-[#1C241E]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Real Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredActivities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="bg-white border-2 border-[#DCE4DD] hover:border-[#4B6F55] rounded-3xl p-6 transition-all flex flex-col justify-between shadow-xs hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${act.bg} ${act.text} border ${act.border} flex items-center justify-center`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F3EFE6] text-[#48544C]">
                    {act.badge}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-[#1C241E] mb-2 group-hover:text-[#4B6F55] transition-colors leading-tight">
                  {act.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#48544C] leading-relaxed mb-6 font-medium">
                  {act.instruction}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleLaunchActivity(act.id, act.title)}
                  className="flex-1 child-touch-target bg-[#4B6F55] hover:bg-[#3D5A45] active:scale-[0.98] text-white text-sm sm:text-base font-extrabold shadow-xs transition-all"
                  aria-label={`Start ${act.title}`}
                >
                  Start Activity
                </button>
                <button
                  type="button"
                  onClick={() => sensoryAudio.speakInstruction(act.instruction, activeChild.sensoryPreferences.voiceSpeed)}
                  className="w-12 h-14 rounded-2xl bg-[#F4F7F4] hover:bg-[#E5EDE6] text-[#4B6F55] flex items-center justify-center transition-colors shrink-0"
                  aria-label={`Listen to instruction for ${act.title}`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
