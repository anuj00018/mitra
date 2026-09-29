'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { Navbar } from '@/components/common/Navbar';

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthForm onSuccess={() => router.push('/')} />
      </main>
    </div>
  );
}
