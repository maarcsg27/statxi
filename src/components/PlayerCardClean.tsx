'use client';

import React from 'react';
import { Shield, Shirt } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

export interface PlayerCardCleanProps {
  name: string;
  position: string;
  nationality: string;
  clubName?: string | null;
  shirtNumber?: number;
  highlightStat?: {
    label: string;
    value: string | number;
  };
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  variant?: 'emerald' | 'gold' | 'cyan' | 'purple';
}

const COUNTRY_FLAGS: Record<string, string> = {
  Spain: '🇪🇸',
  France: '🇫🇷',
  Norway: '🇳🇴',
  Brazil: '🇧🇷',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Argentina: '🇦🇷',
  Portugal: '🇵🇹',
  Belgium: '🇧🇪',
  Egypt: '🇪🇬',
  Poland: '🇵🇱',
  Germany: '🇩🇪',
  Croatia: '🇭🇷',
  Uruguay: '🇺🇾',
  Italy: '🇮🇹',
  Netherlands: '🇳🇱',
};

export default function PlayerCardClean({
  name,
  position,
  nationality,
  clubName,
  shirtNumber = 10,
  highlightStat,
  isSelected = false,
  isRevealed = true,
  onClick,
  variant = 'emerald',
}: PlayerCardCleanProps) {
  const flag = COUNTRY_FLAGS[nationality] || '⚽';

  const posCode =
    position === 'Attacker'
      ? 'DEL'
      : position === 'Midfielder'
      ? 'MED'
      : position === 'Defender'
      ? 'DEF'
      : 'POR';

  const posColor =
    position === 'Attacker'
      ? 'bg-red-500/20 text-red-400 border-red-500/40'
      : position === 'Midfielder'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      : position === 'Defender'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      : 'bg-amber-500/20 text-amber-400 border-amber-500/40';

  const handleClick = () => {
    soundFX.playTap();
    if (onClick) onClick();
  };

  const getBorderTheme = () => {
    switch (variant) {
      case 'gold':
        return 'border-amber-400/50 hover:border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]';
      case 'cyan':
        return 'border-cyan-400/50 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]';
      case 'purple':
        return 'border-purple-400/50 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]';
      case 'emerald':
      default:
        return 'border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative w-full select-none rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer text-left bg-slate-900/90 border-2 ${getBorderTheme()} ${
        isSelected
          ? 'scale-105 ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 bg-slate-850'
          : 'hover:-translate-y-1.5 hover:bg-slate-850'
      }`}
    >
      {/* Top Strip: Dorsal + Position + Nationality */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Dorsal Jersey Badge */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-white font-black font-mono text-base shadow-inner group-hover:scale-110 transition-transform">
            #{shirtNumber}
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${posColor}`}>
            {posCode}
          </span>
        </div>

        <span className="text-xl" title={nationality}>
          {flag}
        </span>
      </div>

      {/* Footballer Name */}
      <div className="my-2">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate">
          {name}
        </h3>
        <p className="text-xs font-semibold text-slate-400 truncate mt-0.5 uppercase tracking-wider">
          {clubName || nationality}
        </p>
      </div>

      {/* Stat Value Badge */}
      {highlightStat && (
        <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {highlightStat.label}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-400 block mt-0.5">
            {isRevealed ? highlightStat.value : '???'}
          </span>
        </div>
      )}
    </div>
  );
}
