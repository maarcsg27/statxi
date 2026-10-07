'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Flame, Zap, Shield, Sparkles, User, Settings } from 'lucide-react';

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

  useEffect(() => {
    // Read local stored user or fetch guest profile
    const stored = localStorage.getItem('statxi_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
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

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Zap },
    { href: '/modes', label: 'Juegos', icon: Sparkles },
    { href: '/daily', label: 'Reto Diario', icon: Trophy, badge: 'DAILY' },
    { href: '/leaderboard', label: 'Rankings', icon: Shield },
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-slate-950 text-xl tracking-tighter">XI</span>
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 animate-pulse border-2 border-slate-950" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-white">STAT<span className="text-emerald-400">XI</span></span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Stat-XI Football</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Pill / Streak & Level */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1">
            <Flame className="h-4 w-4 text-amber-400 fill-amber-400/20 animate-bounce" />
            <span className="text-xs font-bold text-amber-300">{user.daily_streak}</span>
            <span className="text-[10px] hidden sm:inline text-amber-400/80 font-medium">días</span>
          </div>

          {/* Level & XP */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
              {user.level}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-200 leading-tight truncate max-w-[90px]">
                {user.username}
              </span>
              <span className="text-[9px] font-medium text-emerald-400 leading-tight">
                {user.xp.toLocaleString()} XP
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
