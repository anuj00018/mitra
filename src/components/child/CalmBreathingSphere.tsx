'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { ArrowLeft, Check } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';

type BreathPhase = 'Breathe In' | 'Hold Gently' | 'Breathe Out' | 'Rest';

export function CalmBreathingSphere({ onExit }: { onExit: () => void }) {
  const { activeChild, logSession } = useApp();
  const [phase, setPhase] = useState<BreathPhase>('Breathe In');
  const [secondsInPhase, setSecondsInPhase] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Breath rhythm timing
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsInPhase(prev => {
        if (prev <= 1) {
          // Transition to next phase
          if (phase === 'Breathe In') {
            setPhase('Hold Gently');
            sensoryAudio.playSoftChime(440, 0.2);
            return 4;
          } else if (phase === 'Hold Gently') {
            setPhase('Breathe Out');
            sensoryAudio.playSoftChime(392, 0.2);
            return 4;
          } else if (phase === 'Breathe Out') {
            setPhase('Rest');
            sensoryAudio.playSoftChime(329, 0.2);
            return 2;
          } else {
            setPhase('Breathe In');
            setCyclesCompleted(c => c + 1);
            sensoryAudio.playSoftChime(440, 0.2);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Canvas visual rendering for the smooth pulsing sphere
  useEffect(() => {
    let animId: number;
    let progress = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Smooth progress calculation based on phase
      const baseRadius = 80;
      const targetRadius = 140;

      if (phase === 'Breathe In') {
        progress += 0.008;
      } else if (phase === 'Breathe Out') {
        progress -= 0.008;
      }
      progress = Math.max(0, Math.min(1, progress));

      const currentRadius = baseRadius + (targetRadius - baseRadius) * progress;

      // Outer soft glow ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius + 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(199, 217, 202, 0.35)';
      ctx.fill();

      // Middle calming sphere
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#4B6F55';
      ctx.fill();

      // Center core
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#3D5A45';
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  const handleFinish = () => {
    sensoryAudio.playSuccessTone();
    const duration = Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
    logSession({
      childId: activeChild.id,
      activityId: 'sensory-sphere',
      activityTitle: 'Sensory Breathing Sphere',
      durationSeconds: Math.max(duration, 30),
      completed: true,
      promptsNeeded: 0,
      accuracyRate: 1.0,
      sensoryFatigueFlag: false,
      childMood: 'calm'
    });
    onExit();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-center">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DCE4DD] text-sm font-bold text-[#1C241E] hover:bg-[#F4F7F4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiet Space</span>
        </button>
        <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#E5EDE6] text-[#2F4535]">
          {cyclesCompleted} Calming Breaths Taken
        </span>
      </div>

      {/* Main Breathing Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-sm flex flex-col items-center">
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C241E] mb-2 tracking-tight">
          {phase}
        </h2>
        <p className="text-sm sm:text-base text-[#48544C] mb-6">
          Follow the sphere as it expands and rests.
        </p>

        {/* Canvas Sphere */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white">
            <span className="text-3xl sm:text-4xl font-black">{secondsInPhase}</span>
            <span className="text-xs uppercase font-bold tracking-widest opacity-90">seconds</span>
          </div>
        </div>

        {/* Reassuring Exit Button */}
        <button
          type="button"
          onClick={handleFinish}
          className="mt-6 child-touch-target px-8 py-4 rounded-2xl bg-[#4B6F55] hover:bg-[#3D5A45] text-white font-extrabold text-lg shadow-sm"
        >
          <Check className="w-6 h-6 mr-2" />
          I Feel Calm Now
        </button>

      </div>

    </div>
  );
}
