'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Volume2, VolumeX } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

export default function MobileHeader() {
  const [muted, setMuted] = useState(false);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    setMuted(soundFX.getMuted());
    const stored = localStorage.getItem('statxi_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.daily_streak) setStreak(u.daily_streak);
      } catch {}
    }
  }, []);

  const handleToggleSound = () => {
    const isMutedNow = soundFX.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) soundFX.playTap();
  };

  return (
    <header className="flex md:hidden sticky top-0 z-40 h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-sm">
          XI
        </div>
        <span className="text-lg font-black tracking-tight text-white">
          STAT<span className="text-emerald-400">XI</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleSound}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
        >
          {muted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
        </button>

        <div className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 border border-amber-500/30">
          <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="font-mono text-xs font-black text-amber-300">{streak}</span>
        </div>
      </div>
    </header>
  );
}
