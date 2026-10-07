'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  Shield,
  Layers,
  ChevronRight,
  Play,
  TrendingUp,
  Medal,
} from 'lucide-react';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { MOCK_SEED_PLAYERS } from '@/lib/data-providers/mock/mock-football-provider';
import FutCard from '@/components/FutCard';
import { soundFX } from '@/lib/audio/sound-effects';

export default function HomePage() {
  const popularModes = GAME_MODES.slice(0, 6);
  const showcasePlayers = MOCK_SEED_PLAYERS.slice(0, 4);

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Stadium Ambient Floodlights */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/25 via-cyan-500/10 to-transparent blur-3xl" />

      {/* Main Game Lobby Banner */}
      <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-10 sm:px-6 lg:px-8 text-center">
        {/* Live Season Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-emerald-500/40 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>TEMPORADA 2024/25 • DATOS OFICIALES EN VIVO</span>
        </div>

        {/* Dynamic Game Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] max-w-5xl mx-auto leading-[0.95]">
          DOMINA LAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">ESTADÍSTICAS</span> DEL FÚTBOL MUNDIAL
        </h1>

        <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">
          El arcade definitivo de minijuegos con datos reales de futbolistas profesionales. Compara, adivina, draftea y escala en el ranking mundial.
        </p>

        {/* Arcade Action Launcher Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/play/higher"
            onClick={() => soundFX.playTap()}
            className="w-full arcade-btn-green py-4 px-8 rounded-2xl text-lg font-black uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="h-6 w-6 fill-slate-950" />
            ¡JUGAR AHORA!
          </Link>

          <Link
            href="/daily"
            onClick={() => soundFX.playTap()}
            className="w-full arcade-btn-gold py-4 px-8 rounded-2xl text-lg font-black uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer"
          >
            <Trophy className="h-6 w-6 fill-slate-950 text-slate-950" />
            RETO DEL DÍA
          </Link>
        </div>

        {/* Live Arcade Ticker */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="game-panel rounded-2xl p-3 text-center border-emerald-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">JUEGOS DISPONIBLES</span>
            <span className="text-2xl font-black font-mono text-white mt-0.5 block">12 Modos</span>
          </div>
          <div className="game-panel rounded-2xl p-3 text-center border-amber-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">DAILY CHALLENGE</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-0.5 block">En Directo</span>
          </div>
          <div className="game-panel rounded-2xl p-3 text-center border-cyan-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">VALORES DE MERCADO</span>
            <span className="text-2xl font-black font-mono text-cyan-300 mt-0.5 block">Histórico</span>
          </div>
          <div className="game-panel rounded-2xl p-3 text-center border-purple-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">FAIR PLAY VALIDATION</span>
            <span className="text-2xl font-black font-mono text-purple-300 mt-0.5 block">Server-Side</span>
          </div>
        </div>
      </section>

      {/* FUT CARDS SHOWCASE */}
      <section className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                ESTRELLAS EN JUEGO
              </h2>
            </div>
            <p className="text-xs text-slate-400">Cartas oficiales con estadísticas verificadas en la base de datos de STATXI</p>
          </div>
          <Link
            href="/modes"
            onClick={() => soundFX.playTap()}
            className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
          >
            Ver catálogo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid of FUT Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {showcasePlayers.map((item, idx) => {
            const ovr =
              item.player.name === 'Kylian Mbappé'
                ? 91
                : item.player.name === 'Erling Haaland'
                ? 91
                : item.player.name === 'Vinícius Júnior'
                ? 90
                : 89;

            const variant = idx === 0 ? 'emerald' : idx === 1 ? 'gold' : idx === 2 ? 'cyan' : 'purple';

            return (
              <FutCard
                key={item.player.id}
                name={item.player.name}
                photo={item.player.photo}
                position={item.player.position}
                nationality={item.player.nationality}
                ovr={ovr}
                variant={variant}
                highlightStat={{
                  label: 'Temporada 24/25',
                  value: `${item.stats2024.goals} Goles • ${item.stats2024.assists} Asist`,
                }}
              />
            );
          })}
        </div>
      </section>

      {/* DAILY CHALLENGE ARCADE BANNER */}
      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-amber-400 text-slate-950 font-black px-3 py-1 text-xs uppercase tracking-wider shadow">
                  RETO OFICIAL HOY
                </span>
                <span className="flex items-center gap-1 text-xs font-black text-amber-300">
                  <Flame className="h-4 w-4 fill-amber-400" /> +200 XP • 1 INTENTO
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                COMPITE EN EL DAILY CHALLENGE
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
                Mismas 5 preguntas generadas con semilla matemática para todos los futboleros del planeta. ¿Podrás llegar al podio del día?
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

      {/* ARCADE GAME CABINET MODES */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              SELECCIÓN DE MINIJUEGOS
            </h2>
            <p className="text-xs text-slate-400">Escoge tu formato favorito y empieza a jugar al instante</p>
          </div>
          <Link
            href="/modes"
            onClick={() => soundFX.playTap()}
            className="text-xs font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1"
          >
            Ver los 12 modos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularModes.map((mode) => (
            <Link
              key={mode.type}
              href={`/play/${mode.type}`}
              onClick={() => soundFX.playTap()}
              className="group relative flex flex-col justify-between rounded-3xl game-panel p-6 border-slate-800 hover:border-emerald-400/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/15 cursor-pointer"
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

                <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors uppercase tracking-tight">
                  {mode.name}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-300 group-hover:text-emerald-400">
                <span>INICIAR PARTIDA</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
