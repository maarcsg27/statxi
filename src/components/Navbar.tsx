'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Flame, Zap, Shield, Sparkles, User, Settings, Volume2, VolumeX, Coins } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

interface QuickUser {
  username: string;
  level: number;
  xp: number;
  daily_streak: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<QuickUser>({
    username: 'CrackXI',
    level: 1,
    xp: 0,
    daily_streak: 1,
  });
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(soundFX.getMuted());

    const stored = localStorage.getItem('statxi_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    } else {
      fetch('/api/profile')
        .then((r) => r.json())
        .then((data) => {
          if (data.profile) {
            setUser(data.profile);
            localStorage.setItem('statxi_user', JSON.stringify(data.profile));
          }
        })
        .catch(() => {});
    }

    const handleUpdate = () => {
      const u = localStorage.getItem('statxi_user');
      if (u) {
        try {
          setUser(JSON.parse(u));
        } catch {}
      }
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('statxi_profile_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('statxi_profile_updated', handleUpdate);
    };
  }, []);

  const handleToggleSound = () => {
    const isMutedNow = soundFX.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) soundFX.playTap();
  };

  const navLinks = [
    { href: '/', label: 'Lobby', icon: Zap },
    { href: '/modes', label: 'Modos', icon: Sparkles },
    { href: '/daily', label: 'Daily', icon: Trophy, badge: 'HOT' },
    { href: '/leaderboard', label: 'Rankings', icon: Shield },
    { href: '/profile', label: 'Mi XI', icon: User },
    { href: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur-xl shadow-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo with Electric Gaming Glow */}
        <Link
          href="/"
          onClick={() => soundFX.playTap()}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:shadow-emerald-500/60 transition-all duration-300 border border-emerald-300/40">
            <span className="font-black text-slate-950 text-2xl tracking-tighter drop-shadow">XI</span>
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-cyan-400 animate-ping border-2 border-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
              STAT<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">XI</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/90 -mt-1">
              Arcade Arena
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-900/90 p-1 border border-slate-800/80 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => soundFX.playTap()}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-500/25 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[8px] font-black text-white animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Gaming HUD Items: Sound + Streak + XP / Level */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={muted ? 'Activar sonido de juego' : 'Silenciar sonido de juego'}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />}
          </button>

          {/* Daily Streak Flame */}
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 px-3 py-1.5 shadow-md shadow-amber-500/10">
            <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span className="font-mono text-xs font-black text-amber-300">{user.daily_streak}</span>
          </div>

          {/* Level Shield & XP */}
          <Link
            href="/profile"
            onClick={() => soundFX.playTap()}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 px-3 py-1.5 transition-all hover:scale-105 cursor-pointer shadow-lg"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 text-xs font-black shadow-sm">
              {user.level}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 truncate max-w-[80px]">
                {user.username}
              </span>
              <span className="font-mono text-[9px] font-bold text-emerald-400 leading-none">
                {user.xp.toLocaleString()} XP
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
