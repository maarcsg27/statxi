'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Sparkles,
  Trophy,
  Shield,
  User,
  Settings,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Share2,
} from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

interface QuickUser {
  username: string;
  level: number;
  xp: number;
  daily_streak: number;
}

export default function Sidebar() {
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
    { href: '/', label: 'Inicio / Lobby', icon: Zap, badge: '' },
    { href: '/modes', label: 'Modos de Juego', icon: Sparkles, badge: '12' },
    { href: '/daily', label: 'Reto Diario', icon: Trophy, badge: 'HOT' },
    { href: '/leaderboard', label: 'Clasificación', icon: Shield, badge: '' },
    { href: '/profile', label: 'Mi Perfil / XI', icon: User, badge: '' },
    { href: '/admin', label: 'Panel Admin', icon: Settings, badge: '' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-slate-950/95 border-r border-slate-800/80 min-h-screen sticky top-0 z-40 p-5 backdrop-blur-xl">
      {/* Brand Header */}
      <Link
        href="/"
        onClick={() => soundFX.playTap()}
        className="flex items-center gap-3 group pb-6 border-b border-slate-850 cursor-pointer"
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-200 border border-emerald-300/40">
          <span className="font-black text-slate-950 text-2xl tracking-tighter drop-shadow">XI</span>
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-cyan-400 animate-ping border-2 border-slate-950" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
            STAT<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">XI</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Football Stats Arena
          </span>
        </div>
      </Link>

      {/* User Mini-Passport Card */}
      <Link
        href="/profile"
        onClick={() => soundFX.playTap()}
        className="my-5 flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all hover:bg-slate-850 cursor-pointer group shadow-lg"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-sm shadow-md">
            {user.level}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase tracking-wide text-white truncate group-hover:text-emerald-300">
              {user.username}
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 font-bold block">
              {user.xp.toLocaleString()} XP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 border border-amber-500/30">
          <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-bounce" />
          <span className="font-mono text-xs font-black text-amber-300">{user.daily_streak}</span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 py-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-1 block">
          Menú Principal
        </span>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => soundFX.playTap()}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 font-black translate-x-1'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                    isActive
                      ? 'bg-slate-950 text-emerald-400'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Play Action Button */}
      <div className="pt-4 border-t border-slate-850 space-y-3">
        <Link
          href="/play/higher"
          onClick={() => soundFX.playTap()}
          className="w-full arcade-btn-green py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Play className="h-4 w-4 fill-slate-950" />
          PARTIDA RÁPIDA
        </Link>

        {/* Audio Toggle Footer */}
        <button
          onClick={handleToggleSound}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="font-bold text-[11px] uppercase tracking-wider">Efectos de Audio</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            {muted ? (
              <>
                <VolumeX className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">MUDO</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span>ON</span>
              </>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
}
