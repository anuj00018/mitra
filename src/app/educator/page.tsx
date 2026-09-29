'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Navbar } from '@/components/common/Navbar';
import { EducatorDashboard } from '@/components/educator/EducatorDashboard';

export default function EducatorPage() {
  const { setRole } = useApp();

  useEffect(() => {
    setRole('educator');
  }, [setRole]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-16">
        <EducatorDashboard />
      </main>
    </div>
  );
}
