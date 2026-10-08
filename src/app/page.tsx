'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Play,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { MOCK_SEED_PLAYERS } from '@/lib/data-providers/mock/mock-football-provider';
import MinigameCard from '@/components/MinigameCard';
import { soundFX } from '@/lib/audio/sound-effects';

export default function HomePage() {
  const popularModes = GAME_MODES.slice(0, 6);
  const topStars = MOCK_SEED_PLAYERS.slice(0, 4);

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Stadium Ambient Lights */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl" />

      {/* Hero Section Centrado */}
      <section className="relative mx-auto max-w-5xl px-4 pt-10 pb-12 sm:px-6 lg:px-8 text-center">
        {/* Centered Season Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-emerald-500/40 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>TEMPORADA 2024/25 • DATOS OFICIALES EN VIVO</span>
        </div>

        {/* Centered Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.95] max-w-4xl mx-auto drop-shadow-md">
          DOMINA LAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">ESTADÍSTICAS</span> DEL FÚTBOL
        </h1>

        {/* Centered Subtitle */}
        <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Compara, pronostica y compite en minijuegos basados en datos reales de futbolistas, clubes y competiciones de élite.
        </p>

        {/* Centered Arcade Launchers */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/play/higher"
            onClick={() => soundFX.playTap()}
            className="w-full arcade-btn-green py-4 px-8 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="h-5 w-5 fill-slate-950" />
            ¡JUGAR AHORA!
          </Link>

          <Link
            href="/daily"
            onClick={() => soundFX.playTap()}
            className="w-full arcade-btn-gold py-4 px-8 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer"
          >
            <Trophy className="h-5 w-5 fill-slate-950 text-slate-950" />
            RETO DEL DÍA
          </Link>
        </div>

        {/* Centered Stats Ticker */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">MINIJUEGOS</span>
            <span className="text-2xl font-black font-mono text-white mt-0.5 block">{GAME_MODES.length} Modos</span>
          </div>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">DAILY CHALLENGE</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-0.5 block">00:00 UTC</span>
          </div>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">BASE DE DATOS</span>
            <span className="text-2xl font-black font-mono text-cyan-300 mt-0.5 block">PostgreSQL</span>
          </div>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">VALIDACIÓN</span>
            <span className="text-2xl font-black font-mono text-purple-300 mt-0.5 block">Server-Side</span>
          </div>
        </div>
      </section>

      {/* TOP PERFORMERS METRIC TICKER (SIN IMÁGENES) */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            LÍDERES ESTADÍSTICOS EN LA BASE DE DATOS
          </h2>
          <p className="text-xs text-slate-400">Registros reales de la temporada 2024/25 disponibles en los juegos</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topStars.map((item, idx) => (
            <div
              key={item.player.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-center hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-mono font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">
                  #{idx + 7}
                </span>
                <span className="text-xs font-black text-emerald-400 uppercase">
                  {item.player.position === 'Attacker' ? 'DEL' : 'MED'}
                </span>
              </div>

              <h4 className="text-base font-black text-white uppercase truncate">
                {item.player.name}
              </h4>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5 uppercase tracking-wide">
                {item.player.nationality}
              </span>

              <div className="mt-3 rounded-xl bg-slate-950 border border-slate-800 p-2 font-mono">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Goles & Asist</span>
                <span className="text-sm font-black text-emerald-400">
                  {item.stats2024.goals} G • {item.stats2024.assists} A
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY CHALLENGE BANNER CENTRADO */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 text-center sm:text-left shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-950 font-black px-3 py-1 text-xs uppercase tracking-wider">
                RETO DIARIO OFICIAL
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                COMPITE EN EL RETO DEL DÍA
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
                Mismas 5 preguntas generadas con semilla matemática para todos los usuarios. 1 intento oficial para la clasificación mundial.
              </p>
            </div>

            <Link
              href="/daily"
              onClick={() => soundFX.playTap()}
              className="arcade-btn-gold py-3.5 px-8 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Trophy className="h-5 w-5 fill-slate-950 text-slate-950" />
              ENTRAR AL RETO
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SELECCIÓN DE MINIJUEGOS CON RECUADROS ILUSTRADOS */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> CATÁLOGO DESTACADO
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
            MINIJUEGOS POPULARES
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
            Cada recuadro cuenta con sus propias reglas, objetivos y multiplicadores. Selecciona uno para empezar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularModes.map((mode) => (
            <MinigameCard key={mode.type} mode={mode} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/modes"
            onClick={() => soundFX.playTap()}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40"
          >
            Explorar los 12 modos completos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
