'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { UserRole } from '@/types';
import { Sliders, Volume2, VolumeX, Sparkles, GraduationCap, Home, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { SensoryQuickBar } from './SensoryQuickBar';
import { sensoryAudio } from '@/lib/audio';

export function Navbar() {
  const { currentRole, setRole, activeChild, childrenList, setActiveChildId, isAuthenticated, userEmail, logoutUser } = useApp();
  const [showSensoryModal, setShowSensoryModal] = useState(false);
  const [showChildPicker, setShowChildPicker] = useState(false);

  const prefs = activeChild.sensoryPreferences;

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    sensoryAudio.playSoftChime(440, 0.2);
  };

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode }> = {
    child: { label: 'Child Mode', icon: <Sparkles className="w-4 h-4 text-[#B8673E]" /> },
    parent: { label: 'Parent Dashboard', icon: <Home className="w-4 h-4 text-[#4B6F55]" /> },
    educator: { label: 'Educator Hub', icon: <GraduationCap className="w-4 h-4 text-[#3C6C82]" /> }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FBF9F5]/90 border-b border-[#E2DBD0] backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo / App Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E5EDE6] border border-[#C7D9CA] flex items-center justify-center shadow-xs">
                <span className="text-xl sm:text-2xl font-black text-[#2F4535] tracking-tight">M</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1C241E]">
                  MITRA
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[#E5EDE6] text-[#2F4535]">
                  Learning Companion
                </span>
              </div>
            </div>

            {/* Experience Role Switcher */}
            <nav className="flex items-center p-1 bg-[#F3EFE6] border border-[#E2DBD0] rounded-2xl" aria-label="Role Navigation">
              {(['child', 'parent', 'educator'] as UserRole[]).map((role) => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                      isActive
                        ? 'bg-white text-[#1C241E] shadow-xs border border-[#DCE4DD]'
                        : 'text-[#48544C] hover:text-[#1C241E]'
                    }`}
                  >
                    {roleLabels[role].icon}
                    <span className="capitalize">{role}</span>
                  </button>
                );
              })}
            </nav>

            {/* Child Profile & Accessibility Quick Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Active Child Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChildPicker(!showChildPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4DD] hover:bg-[#F4F7F4] text-[#1C241E] transition-colors"
                  aria-label={`Current child learner: ${activeChild.displayName}. Click to change learner.`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center text-xs font-bold uppercase">
                    {activeChild.displayName.slice(0, 1)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">{activeChild.displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B786F]" />
                </button>

                {showChildPicker && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-2 border-[#DCE4DD] shadow-lg py-2 z-50">
                    <p className="px-4 py-1 text-xs font-bold text-[#6B786F] uppercase tracking-wider">
                      Select Learner
                    </p>
                    {childrenList.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          setActiveChildId(child.id);
                          setShowChildPicker(false);
                          sensoryAudio.playSoftChime(523.25, 0.2);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs sm:text-sm hover:bg-[#F4F7F4] transition-colors ${
                          activeChild.id === child.id ? 'font-bold bg-[#E5EDE6] text-[#2F4535]' : 'text-[#1C241E]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-[#F3EFE6] text-[#1C241E] flex items-center justify-center font-bold text-xs uppercase">
                            {child.displayName[0]}
                          </span>
                          <div>
                            <p className="leading-tight">{child.name}</p>
                            <span className="text-[11px] text-[#6B786F] font-normal">{child.ageYears} yrs • {child.learningTier}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sensory Settings Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowSensoryModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-[#DCE4DD] hover:bg-[#F4F7F4] text-[#1C241E] transition-colors shadow-2xs"
                title="Sensory & Accessibility Settings"
                aria-label="Open Sensory and Accessibility Settings"
              >
                {prefs.soundEffectsEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#4B6F55]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <Sliders className="w-4 h-4 text-[#6B786F]" />
              </button>

              {/* Authentication Status & Quick Toggle */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    sensoryAudio.playSoftChime(329.63, 0.2);
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3EFE6] border border-[#E2DBD0] hover:bg-[#E8E2D5] text-[#48544C] text-xs font-semibold transition-colors"
                  title={`Signed in as ${userEmail || 'Parent'}. Click to sign out.`}
                  aria-label="Sign out of MITRA"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4B6F55] hover:bg-[#3D5A45] text-white text-xs font-bold transition-colors shadow-xs"
                  aria-label="Sign into account"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Sensory Quick Controls Modal */}
      <SensoryQuickBar 
        isOpen={showSensoryModal} 
        onClose={() => setShowSensoryModal(false)} 
      />
    </>
  );
}
