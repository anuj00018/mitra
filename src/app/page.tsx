'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Navbar } from '@/components/common/Navbar';
import { ChildDashboard } from '@/components/child/ChildDashboard';
import { ParentDashboard } from '@/components/parent/ParentDashboard';
import { EducatorDashboard } from '@/components/educator/EducatorDashboard';
import { ShieldCheck, Wind } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';

export default function HomePage() {
  const { currentRole, setRole, setActiveActivityId } = useApp();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Universal Calming Application Header */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentRole === 'child' && <ChildDashboard />}
        {currentRole === 'parent' && <ParentDashboard />}
        {currentRole === 'educator' && <EducatorDashboard />}
      </main>

      {/* Reassuring Footer with Accessibility Affirmation */}
      <footer className="w-full bg-[#F3EFE6] border-t border-[#E2DBD0] py-8 text-xs text-[#48544C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#1C241E]">MITRA Learning Companion</span>
            <span className="hidden sm:inline text-[#B8673E]">•</span>
            <span className="flex items-center gap-1 text-[#2F4535] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#4B6F55]" />
              WCAG 2.2 AA / Sensory Safe
            </span>
          </div>

          {/* Quick Calm Button for Children in Any Role */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setRole('child');
                setActiveActivityId('sensory-sphere');
                sensoryAudio.playSoftChime(440, 0.2);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4DD] hover:bg-[#E5EDE6] text-[#2F4535] font-bold transition-colors"
            >
              <Wind className="w-3.5 h-3.5 text-[#4B6F55]" />
              Quick Calm Corner
            </button>

            <span className="text-[#6B786F]">
              Designed with Neurodiversity Specialists
            </span>
          </div>

        </div>
      </footer>
    </div>
  );
}
