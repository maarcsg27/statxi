'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Zap, Shield, Sparkles, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Inicio', icon: Zap },
    { href: '/modes', label: 'Juegos', icon: Sparkles },
    { href: '/daily', label: 'Diario', icon: Trophy },
    { href: '/leaderboard', label: 'Rankings', icon: Shield },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
