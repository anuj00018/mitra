'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Sparkles, Home, GraduationCap, Lock, Mail } from 'lucide-react';
import { sensoryAudio } from '@/lib/audio';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (role: UserRole) => {
    loginUser(`${role}@mitra.org`, role);
    sensoryAudio.playSuccessTone();
    setStatusMessage(`Authenticated in Demo Mode as ${role.toUpperCase()}`);
    onSuccess?.();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    if (!isSupabaseConfigured) {
      // In local mode without external credentials, provide immediate safe fallback
      setTimeout(() => {
        setIsLoading(false);
        loginUser(email || 'parent@mitra.org', 'parent');
        setStatusMessage('Signed in locally (demo environment).');
        onSuccess?.();
      }, 500);
      return;
    }

    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatusMessage('Successfully signed in.');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStatusMessage('Account created. Check your email for verification.');
      }
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication error.';
      setStatusMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#DCE4DD] shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E5EDE6] text-[#2F4535] flex items-center justify-center font-black text-2xl mb-2">
          M
        </div>
        <h2 className="text-2xl font-bold text-[#1C241E]">Welcome to MITRA</h2>
        <p className="text-xs sm:text-sm text-[#48544C]">
          Autism-informed visual learning and sensory companion
        </p>
      </div>

      {/* 1-Click Role Exploration Shortcuts (Essential for review/evaluation) */}
      <div className="mb-6 p-4 rounded-2xl bg-[#FBF9F5] border border-[#E2DBD0]">
        <p className="text-xs font-bold text-[#6B786F] uppercase tracking-wider mb-2.5 text-center">
          Instant Experience Switching
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('child')}
            className="p-2.5 rounded-xl bg-white border border-[#DCE4DD] hover:bg-[#E5EDE6] text-[#1C241E] text-xs font-bold flex flex-col items-center gap-1 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#B8673E]" />
            Child
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('parent')}
            className="p-2.5 rounded-xl bg-white border border-[#DCE4DD] hover:bg-[#E5EDE6] text-[#1C241E] text-xs font-bold flex flex-col items-center gap-1 transition-all"
          >
            <Home className="w-4 h-4 text-[#4B6F55]" />
            Parent
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('educator')}
            className="p-2.5 rounded-xl bg-white border border-[#DCE4DD] hover:bg-[#E5EDE6] text-[#1C241E] text-xs font-bold flex flex-col items-center gap-1 transition-all"
          >
            <GraduationCap className="w-4 h-4 text-[#3C6C82]" />
            Educator
          </button>
        </div>
      </div>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E8E2D5]" />
        </div>
        <span className="relative px-3 bg-white text-[11px] font-semibold text-[#6B786F] uppercase">
          Or Supabase Account
        </span>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleAuthSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1C241E] mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6B786F] absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4DD] focus:outline-[#4B6F55]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C241E] mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6B786F] absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4DD] focus:outline-[#4B6F55]"
            />
          </div>
        </div>

        {statusMessage && (
          <p className="text-xs text-[#2F4535] bg-[#E5EDE6] p-2.5 rounded-xl font-medium">
            {statusMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-[#4B6F55] hover:bg-[#3D5A45] text-white font-bold text-sm transition-colors"
        >
          {isLoading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
          className="text-xs font-semibold text-[#4B6F55] hover:underline"
        >
          {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>

    </div>
  );
}
