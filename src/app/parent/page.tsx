'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Navbar } from '@/components/common/Navbar';
import { ParentDashboard } from '@/components/parent/ParentDashboard';

export default function ParentPage() {
  const { setRole } = useApp();

  useEffect(() => {
    setRole('parent');
  }, [setRole]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-16">
        <ParentDashboard />
      </main>
    </div>
  );
}
