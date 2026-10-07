import React from 'react';
import Link from 'next/link';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { Sparkles, Trophy, ChevronRight, Zap } from 'lucide-react';

export default function GameModesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" /> 12 MINIJUEGOS OFICIALES
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          Elige tu desafío en STATXI
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Desde adivinanzas de reflejos rápidos hasta retos tácticos de acumulación y valor de mercado. Todos basados en datos reales de futbolistas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_MODES.map((mode) => (
          <div
            key={mode.type}
            className="flex flex-col justify-between rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition-all hover:bg-slate-850"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400 border border-slate-700">
                  {mode.badge}
                </span>
                <span className="text-xs text-slate-400">
                  {mode.defaultRounds} rondas • {mode.defaultTimeLimitSeconds}s
                </span>
              </div>

              <h3 className="text-xl font-black text-white">{mode.name}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{mode.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href={`/play/${mode.type}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-black text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
              >
                <Zap className="h-3.5 w-3.5 fill-slate-950" />
                JUGAR MODO
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
