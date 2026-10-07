'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Flame, Trophy, Target, Shield, Zap, Sparkles, Clock, Compass, Layers, GitMerge, Dices } from 'lucide-react';
import { GameModeInfo } from '@/lib/game-engine/types';
import { soundFX } from '@/lib/audio/sound-effects';

export interface MinigameCardProps {
  mode: GameModeInfo;
}

// Visual theme and illustration details per game mode
const MODE_ILLUSTRATIONS: Record<
  string,
  {
    gradient: string;
    icon: React.ElementType;
    iconColor: string;
    bgAccent: string;
    symbol: string;
    tagline: string;
  }
> = {
  higher: {
    gradient: 'from-emerald-600 via-teal-700 to-slate-900',
    icon: Flame,
    iconColor: 'text-emerald-300',
    bgAccent: 'rgba(16, 185, 129, 0.25)',
    symbol: '▲ MÁS',
    tagline: 'Duelo de Máximos',
  },
  lower: {
    gradient: 'from-rose-600 via-red-800 to-slate-900',
    icon: Shield,
    iconColor: 'text-rose-300',
    bgAccent: 'rgba(244, 63, 94, 0.25)',
    symbol: '▼ MENOS',
    tagline: 'Control y Disciplina',
  },
  'higher-lower': {
    gradient: 'from-cyan-600 via-blue-800 to-slate-900',
    icon: Zap,
    iconColor: 'text-cyan-300',
    bgAccent: 'rgba(6, 182, 212, 0.25)',
    symbol: '⚡ VS',
    tagline: 'Racha Consecutiva',
  },
  exact: {
    gradient: 'from-amber-500 via-yellow-700 to-slate-900',
    icon: Target,
    iconColor: 'text-amber-300',
    bgAccent: 'rgba(245, 158, 11, 0.25)',
    symbol: '🎯 EXACTO',
    tagline: 'Francotirador Big Data',
  },
  closest: {
    gradient: 'from-teal-600 via-emerald-800 to-slate-900',
    icon: Compass,
    iconColor: 'text-teal-300',
    bgAccent: 'rgba(20, 184, 166, 0.25)',
    symbol: '📍 RADAR',
    tagline: 'Aproximación Numérica',
  },
  limit: {
    gradient: 'from-purple-600 via-indigo-800 to-slate-900',
    icon: Layers,
    iconColor: 'text-purple-300',
    bgAccent: 'rgba(168, 85, 247, 0.25)',
    symbol: '🃏 21',
    tagline: 'Blackjack Futbolero',
  },
  target: {
    gradient: 'from-blue-600 via-indigo-900 to-slate-900',
    icon: Trophy,
    iconColor: 'text-blue-300',
    bgAccent: 'rgba(59, 130, 246, 0.25)',
    symbol: '🏆 100',
    tagline: 'Suma de Plantilla',
  },
  'guess-stat': {
    gradient: 'from-amber-600 via-orange-800 to-slate-900',
    icon: Sparkles,
    iconColor: 'text-amber-300',
    bgAccent: 'rgba(249, 115, 22, 0.25)',
    symbol: '❓ TRIVIA',
    tagline: 'Elige la Cifra',
  },
  draft: {
    gradient: 'from-emerald-700 via-slate-800 to-slate-900',
    icon: Trophy,
    iconColor: 'text-emerald-300',
    bgAccent: 'rgba(16, 185, 129, 0.25)',
    symbol: '📋 XI',
    tagline: 'Director Deportivo',
  },
  'squad-dna': {
    gradient: 'from-fuchsia-600 via-purple-900 to-slate-900',
    icon: Sparkles,
    iconColor: 'text-fuchsia-300',
    bgAccent: 'rgba(217, 70, 239, 0.25)',
    symbol: '🧬 ADN',
    tagline: 'Radar de Atributos',
  },
  'player-chain': {
    gradient: 'from-cyan-700 via-teal-900 to-slate-900',
    icon: GitMerge,
    iconColor: 'text-cyan-300',
    bgAccent: 'rgba(6, 182, 212, 0.25)',
    symbol: '🔗 LINK',
    tagline: 'Conexión de Clubes',
  },
  'random-challenge': {
    gradient: 'from-rose-600 via-purple-800 to-slate-900',
    icon: Dices,
    iconColor: 'text-pink-300',
    bgAccent: 'rgba(244, 63, 94, 0.25)',
    symbol: '🎲 RANDOM',
    tagline: 'Parámetros Sorpresa',
  },
};

export default function MinigameCard({ mode }: MinigameCardProps) {
  const illu = MODE_ILLUSTRATIONS[mode.type] || MODE_ILLUSTRATIONS.higher;
  const Icon = illu.icon;

  return (
    <div className="group flex flex-col justify-between rounded-3xl bg-slate-900/90 border-2 border-slate-800 hover:border-emerald-500/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden">
      {/* 1. Recuadro / Imagen Ilustrada del Minijuego */}
      <div className={`relative h-44 w-full bg-gradient-to-br ${illu.gradient} p-5 flex flex-col justify-between overflow-hidden border-b border-white/10`}>
        {/* Pitch Lines Vector Texture */}
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="50%" cy="50%" r="40" stroke="white" strokeWidth="2" fill="none" />
            <rect x="10%" y="10%" width="80%" height="80%" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-white/10 shadow-sm">
            {mode.badge}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>{mode.defaultTimeLimitSeconds}s / ronda</span>
          </div>
        </div>

        {/* Center / Symbol Graphic */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/80 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
            <Icon className={`h-6 w-6 ${illu.iconColor}`} />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 block">
              {illu.tagline}
            </span>
            <span className="font-mono text-xl font-black text-white tracking-tight drop-shadow">
              {illu.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo con Nombre y Explicación */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors">
            {mode.name}
          </h3>

          {/* Explicación del minijuego */}
          <div className="mt-3 rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              ¿Cómo se juega?
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {mode.description}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="rounded-md bg-slate-800 px-2 py-0.5 font-bold">
              {mode.defaultRounds} Rondas
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Estadísticas reales</span>
          </div>
        </div>

        {/* 3. Botón para Jugar */}
        <div className="mt-6 pt-4 border-t border-slate-850">
          <Link
            href={`/play/${mode.type}`}
            onClick={() => soundFX.playTap()}
            className="w-full arcade-btn-green py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            JUGAR MODO
          </Link>
        </div>
      </div>
    </div>
  );
}
