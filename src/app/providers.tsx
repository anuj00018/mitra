'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { AppProvider, useApp } from '@/lib/store';

function SensoryThemeWrapper({ children }: { children: ReactNode }) {
  const { activeChild } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefs = activeChild?.sensoryPreferences;

  const contrastClass = mounted && prefs?.highContrastMode ? 'high-contrast' : '';
  const motionClass = mounted && prefs?.reducedMotion ? 'reduce-motion' : '';
  const fontClass = mounted && prefs?.fontSizeScale === 'extra-large' 
    ? 'font-scale-xlarge' 
    : mounted && prefs?.fontSizeScale === 'large' 
    ? 'font-scale-large' 
    : '';

  return (
    <div className={`min-h-screen flex flex-col ${contrastClass} ${motionClass} ${fontClass}`}>
      {children}
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <SensoryThemeWrapper>
        {children}
      </SensoryThemeWrapper>
    </AppProvider>
  );
}
