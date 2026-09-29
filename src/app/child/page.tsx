'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Navbar } from '@/components/common/Navbar';
import { ChildDashboard } from '@/components/child/ChildDashboard';

export default function ChildPage() {
  const { setRole } = useApp();

  useEffect(() => {
    setRole('child');
  }, [setRole]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-16">
        <ChildDashboard />
      </main>
    </div>
  );
}
