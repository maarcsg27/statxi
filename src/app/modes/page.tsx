'use client';

import React from 'react';
import Link from 'next/link';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { Sparkles, Trophy, Play, Zap } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

export default function GameModesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> 12 MINIJUEGOS ARCADE
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
          SELECCIONA TU DESAFÍO
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
          Duelos 1v1, retos de acumulación, valores de mercado y draft táctico. Cada minijuego cuenta con sus propias reglas y multiplicadores de puntuación.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAME_MODES.map((mode) => (
          <div
            key={mode.type}
            className="group flex flex-col justify-between rounded-3xl game-panel p-6 border-slate-800 hover:border-emerald-400/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/15"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-xl bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-slate-700">
                  {mode.badge}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {mode.defaultRounds} Rondas • {mode.defaultTimeLimitSeconds}s
                </span>
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-emerald-300 transition-colors">
                {mode.name}
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">
                {mode.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
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
        ))}
      </div>
    </div>
  );
}
