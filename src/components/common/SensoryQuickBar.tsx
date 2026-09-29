'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Volume2, VolumeX, Eye, Type, Palette, Clock, Check } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';

interface SensoryQuickBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SensoryQuickBar({ isOpen, onClose }: SensoryQuickBarProps) {
  const { activeChild, updateSensoryPreferences } = useApp();
  const prefs = activeChild.sensoryPreferences;

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label="Sensory and Accessibility Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl bg-white border-2 border-[#DCE4DD] rounded-3xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1C241E]">Sensory & Comfort Controls</h2>
              <p className="text-sm text-[#48544C]">Customized for {activeChild.displayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#F4F7F4] text-[#2F4535] hover:bg-[#E5EDE6] transition-colors"
          >
            Done
          </button>
        </div>

        <div className="space-y-6">
          {/* Audio Volume & Mute */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0]">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="sound-volume" className="flex items-center gap-2 font-semibold text-[#1C241E]">
                {prefs.soundEffectsEnabled ? <Volume2 className="w-5 h-5 text-[#4B6F55]" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                Sound Cues & Chimes
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !prefs.soundEffectsEnabled;
                  updateSensoryPreferences({ soundEffectsEnabled: nextVal });
                  if (nextVal) sensoryAudio.playSoftChime(523.25, 0.3);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  prefs.soundEffectsEnabled ? 'bg-[#C7D9CA] text-[#1C241E]' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {prefs.soundEffectsEnabled ? 'Audio Active' : 'Muted'}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                id="sound-volume"
                type="range"
                min="0"
                max="100"
                value={prefs.soundVolumePercent}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateSensoryPreferences({ soundVolumePercent: val });
                }}
                onMouseUp={() => sensoryAudio.playSoftChime(440, 0.25)}
                className="w-full h-2 bg-[#E2DBD0] rounded-lg appearance-none cursor-pointer accent-[#4B6F55]"
              />
              <span className="text-sm font-medium text-[#48544C] min-w-10 text-right">
                {prefs.soundVolumePercent}%
              </span>
            </div>
          </div>

          {/* Voice Narration Speed */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#1C241E]">Spoken Instruction Speed</span>
              <button
                type="button"
                onClick={() => sensoryAudio.speakInstruction("Here is a calm voice test.", prefs.voiceSpeed)}
                className="text-xs font-medium text-[#4B6F55] hover:underline"
              >
                Play sample
              </button>
            </div>
            <p className="text-xs text-[#6B786F] mb-3">Slower pacing aids verbal auditory processing</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '0.75x (Gentle)', value: 0.75 },
                { label: '0.85x (Recommended)', value: 0.85 },
                { label: '1.0x (Standard)', value: 1.0 }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => updateSensoryPreferences({ voiceSpeed: item.value })}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    prefs.voiceSpeed === item.value
                      ? 'bg-[#4B6F55] text-white border-[#4B6F55]'
                      : 'bg-white text-[#48544C] border-[#DCE4DD] hover:bg-[#F4F7F4]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Palette */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0]">
            <label className="flex items-center gap-2 font-semibold text-[#1C241E] mb-2">
              <Palette className="w-5 h-5 text-[#B8673E]" />
              Calming Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'gentle-sage' as const, name: 'Gentle Sage', bg: 'bg-[#E5EDE6]', border: 'border-[#4B6F55]' },
                { id: 'soft-sky' as const, name: 'Soft Sky', bg: 'bg-[#E1EEF5]', border: 'border-[#3C6C82]' },
                { id: 'warm-sand' as const, name: 'Warm Sand', bg: 'bg-[#F7EEE3]', border: 'border-[#B8673E]' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateSensoryPreferences({ calmPalette: p.id })}
                  className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    prefs.calmPalette === p.id ? `${p.bg} ${p.border} ring-2 ring-[#4B6F55]` : 'bg-white border-[#E2DBD0]'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#1C241E]">{p.name}</span>
                  {prefs.calmPalette === p.id && <Check className="w-4 h-4 text-[#4B6F55]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size Scale */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0]">
            <label className="flex items-center gap-2 font-semibold text-[#1C241E] mb-2">
              <Type className="w-5 h-5 text-[#4B6F55]" />
              Text Legibility Scaling
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal' as const, label: 'Standard (16px)' },
                { id: 'large' as const, label: 'Large (18px)' },
                { id: 'extra-large' as const, label: 'Extra Large (20px)' }
              ].map((scale) => (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => updateSensoryPreferences({ fontSizeScale: scale.id })}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    prefs.fontSizeScale === scale.id
                      ? 'bg-[#2F4535] text-white border-[#2F4535]'
                      : 'bg-white text-[#48544C] border-[#DCE4DD] hover:bg-[#F4F7F4]'
                  }`}
                >
                  {scale.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast & Timer Anxiety Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSensoryPreferences({ highContrastMode: !prefs.highContrastMode })}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                prefs.highContrastMode ? 'bg-[#000000] text-white border-black' : 'bg-white border-[#DCE4DD] text-[#1C241E]'
              }`}
            >
              <Eye className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">High Contrast Mode</p>
                <p className="text-xs opacity-80">Solid black borders and stark text</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSensoryPreferences({ allowTimerDisplays: !prefs.allowTimerDisplays })}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                prefs.allowTimerDisplays ? 'bg-[#E5EDE6] border-[#4B6F55] text-[#1C241E]' : 'bg-white border-[#DCE4DD] text-[#1C241E]'
              }`}
            >
              <Clock className="w-5 h-5 mt-0.5 shrink-0 text-[#B8673E]" />
              <div>
                <p className="text-sm font-bold">Visual Timers</p>
                <p className="text-xs text-[#6B786F]">
                  {prefs.allowTimerDisplays ? 'Timers visible' : 'Hidden to prevent anxiety'}
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E8E2D5] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4B6F55] text-white font-semibold hover:bg-[#3D5A45] transition-colors shadow-xs"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
