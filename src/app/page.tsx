import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Target,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { MOCK_SEED_PLAYERS } from '@/lib/data-providers/mock/mock-football-provider';

export default function HomePage() {
  const popularModes = GAME_MODES.slice(0, 6);
  const featuredStars = MOCK_SEED_PLAYERS.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Lighting & Grid Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 text-center">
        {/* Live Football Intelligence Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          DATOS REALES • TOP 5 LIGAS & CHAMPIONS
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto uppercase">
          ¿Cuánto sabes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">estadísticas</span> de fútbol?
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Pon a prueba tu instinto con minijuegos impulsados por millones de datos reales de futbolistas, clubes y competiciones de élite.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/play/higher"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-8 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap className="h-5 w-5 fill-slate-950" />
            JUGAR AHORA
          </Link>
          <Link
            href="/daily"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-8 py-4 text-base font-bold text-white transition-all hover:border-slate-600"
          >
            <Trophy className="h-5 w-5 text-amber-400" />
            RETO DIARIO
          </Link>
        </div>

        {/* Live Stats Ticker Strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">JUEGOS</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">12 Modos</span>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PROVEEDOR</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">API-Football</span>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">VALUACIONES</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">Histórico MV</span>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">LATENCIA</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">&lt; 50ms</span>
          </div>
        </div>
      </section>

      {/* Daily Challenge Spotlight Card */}
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-black text-amber-300 uppercase tracking-wider">
                  HOY • 1 INTENTO OFICIAL
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> +200 XP
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Daily Challenge Oficial
              </h2>
              <p className="text-sm text-slate-300 max-w-xl">
                Un reto idéntico y determinista para todos los usuarios del mundo. Clasifica en el ranking global del día.
              </p>
            </div>

            <Link
              href="/daily"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Trophy className="h-4 w-4" />
              JUGAR RETO DIARIO
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Games Grid */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">MINIJUEGOS POPULARES</h2>
            <p className="text-xs text-slate-400">Descubre mecánicas únicas basadas en datos reales</p>
          </div>
          <Link
            href="/modes"
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Ver todos ({GAME_MODES.length}) <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularModes.map((mode) => (
            <Link
              key={mode.type}
              href={`/play/${mode.type}`}
              className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-5 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-850 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400 border border-slate-700">
                    {mode.badge}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {mode.defaultRounds} rondas • {mode.defaultTimeLimitSeconds}s
                  </span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                  {mode.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {mode.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-emerald-400">
                <span>Jugar partida</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Football Stars Pool */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-white tracking-tight">CRACKS DEL MOMENTO</h2>
          <p className="text-xs text-slate-400">Datos reales 2024/25 sincronizados en la base de datos de STATXI</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featuredStars.map((item) => (
            <div
              key={item.player.id}
              className="rounded-2xl bg-slate-900 border border-slate-800/80 p-4 text-center hover:border-slate-700 transition-colors"
            >
              <div className="h-16 w-16 mx-auto rounded-xl bg-slate-800 overflow-hidden relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.player.photo || ''}
                  alt={item.player.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <h4 className="text-sm font-bold text-white truncate">{item.player.name}</h4>
              <span className="text-[11px] text-slate-400 block">{item.player.position}</span>
              <div className="mt-2 inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-black text-emerald-400 font-mono">
                {item.stats2024.goals} Goles • {item.stats2024.assists} Asist
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
