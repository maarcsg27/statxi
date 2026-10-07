'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Zap, Shield, Sparkles, User } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Lobby', icon: Zap },
    { href: '/modes', label: 'Modos', icon: Sparkles },
    { href: '/daily', label: 'Daily', icon: Trophy },
    { href: '/leaderboard', label: 'Rankings', icon: Shield },
    { href: '/profile', label: 'Mi XI', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-emerald-500/20 bg-slate-950/95 backdrop-blur-xl md:hidden shadow-2xl">
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => soundFX.playTap()}
              className={`flex flex-col items-center justify-center gap-1 transition-all py-1 rounded-xl ${
                isActive
                  ? 'text-emerald-400 font-black scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-emerald-500/20 border border-emerald-400/40 shadow-sm' : ''
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
