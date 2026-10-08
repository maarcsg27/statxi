'use client';

import React from 'react';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { Sparkles } from 'lucide-react';
import MinigameCard from '@/components/MinigameCard';

export default function GameModesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 pb-24">
      {/* Título Centrado */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
          <Sparkles className="h-4 w-4" /> {GAME_MODES.length} MINIJUEGOS OFICIALES STATXI
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-md">
          SELECCIONA TU DESAFÍO
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Duelos de máximos, comparativas de tarjetas, aproximación numérica y estrategia de acumulación. Pon a prueba tus conocimientos en cada modalidad.
        </p>
      </div>

      {/* Grid de Recuadros Ilustrados de Cada Minijuego */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAME_MODES.map((mode) => (
          <MinigameCard key={mode.type} mode={mode} />
        ))}
      </div>
    </div>
  );
}
