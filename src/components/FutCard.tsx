'use client';

import React from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

export interface FutCardProps {
  name: string;
  photo?: string | null;
  position: string;
  nationality: string;
  clubName?: string | null;
  clubLogo?: string | null;
  ovr?: number;
  highlightStat?: {
    label: string;
    value: string | number;
  };
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  variant?: 'gold' | 'emerald' | 'cyan' | 'purple';
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

export default function FutCard({
  name,
  photo,
  position,
  nationality,
  clubName,
  clubLogo,
  ovr = 88,
  highlightStat,
  isSelected = false,
  isRevealed = true,
  onClick,
  variant = 'gold',
}: FutCardProps) {
  const flag = COUNTRY_FLAGS[nationality] || '⚽';

  // Position badge abbreviation
  const posCode =
    position === 'Attacker'
      ? 'DC'
      : position === 'Midfielder'
      ? 'MC'
      : position === 'Defender'
      ? 'DFC'
      : 'POR';

  const handleClick = () => {
    soundFX.playTap();
    if (onClick) onClick();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          border: 'border-emerald-400',
          badgeBg: 'bg-emerald-500 text-slate-950',
          glow: 'shadow-[0_0_30px_rgba(0,255,135,0.3)]',
          gradient: 'from-[#052b1a] via-[#091811] to-[#040d09]',
          accentText: 'text-emerald-400',
        };
      case 'cyan':
        return {
          border: 'border-cyan-400',
          badgeBg: 'bg-cyan-500 text-slate-950',
          glow: 'shadow-[0_0_30px_rgba(0,240,255,0.3)]',
          gradient: 'from-[#072430] via-[#08151c] to-[#03090c]',
          accentText: 'text-cyan-400',
        };
      case 'purple':
        return {
          border: 'border-purple-400',
          badgeBg: 'bg-purple-500 text-white',
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
          gradient: 'from-[#240b36] via-[#150720] to-[#0a0310]',
          accentText: 'text-purple-400',
        };
      case 'gold':
      default:
        return {
          border: 'border-amber-400/80',
          badgeBg: 'bg-amber-400 text-slate-950',
          glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
          gradient: 'from-[#2a1d08] via-[#141008] to-[#0a0805]',
          accentText: 'text-amber-400',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={handleClick}
      className={`group relative w-full select-none rounded-3xl p-1 transition-all duration-300 cursor-pointer ${
        isSelected
          ? `scale-105 ${styles.glow} ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950`
          : 'hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl'
      }`}
    >
      {/* Outer Shield Container */}
      <div
        className={`relative overflow-hidden rounded-[22px] border-2 bg-gradient-to-b ${styles.gradient} ${styles.border} p-4 pb-5 shadow-2xl backdrop-blur-md`}
      >
        {/* Holographic light reflection sheen */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:translate-x-48 group-hover:translate-y-48" />

        {/* Top Header: OVR + Position + Country Flag */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {ovr}
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              {posCode}
            </span>
            <span className="text-base mt-0.5">{flag}</span>
            {clubLogo && (
              <div className="relative mt-1 h-5 w-5 overflow-hidden">
                <Image src={clubLogo} alt={clubName || ''} fill className="object-contain" />
              </div>
            )}
          </div>

          {/* Player Photo with Stadium Lighting Backdrop */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent blur-md" />
            {photo ? (
              <Image
                src={photo}
                alt={name}
                fill
                className="object-cover object-top drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-black text-2xl text-slate-600">
                {name.substring(0, 2)}
              </div>
            )}
          </div>
        </div>

        {/* Player Name Banner */}
        <div className="mt-3 text-center border-t border-white/10 pt-2.5">
          <h3 className="truncate font-black uppercase tracking-tight text-lg sm:text-xl text-white group-hover:text-emerald-300 transition-colors drop-shadow-md">
            {name}
          </h3>
          <p className="truncate text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {clubName || nationality}
          </p>
        </div>

        {/* Highlight Stat Badge */}
        {highlightStat && (
          <div className="mt-3 rounded-xl bg-slate-950/80 border border-white/10 p-2 text-center backdrop-blur-sm shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {highlightStat.label}
            </span>
            <span className={`font-mono text-lg sm:text-xl font-black ${styles.accentText} drop-shadow`}>
              {isRevealed ? highlightStat.value : '???'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
