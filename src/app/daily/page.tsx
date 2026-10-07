'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Flame, ArrowRight, Shield, Clock, Medal, Sparkles, Play } from 'lucide-react';
import { DailyChallengeRecord, DailyChallengeAttemptRecord } from '@/lib/db/types';
import { soundFX } from '@/lib/audio/sound-effects';

export default function DailyChallengePage() {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallengeRecord | null>(null);
  const [leaderboard, setLeaderboard] = useState<DailyChallengeAttemptRecord[]>([]);

  useEffect(() => {
    fetch('/api/daily')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setChallenge(data.challenge);
          setLeaderboard(data.leaderboard || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const todayFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
      {/* Daily Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-2 border-amber-500/50 p-6 sm:p-10 mb-8 relative overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider capitalize">
                {todayFormatted}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              {challenge?.title || 'Daily Challenge Oficial'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              {challenge?.description ||
                'Un conjunto idéntico de 5 preguntas generado mediante semilla matemática. Compite en igualdad de condiciones con toda la comunidad.'}
            </p>
          </div>

          {challenge && (
            <Link
              href={`/play/${challenge.game_type}`}
              onClick={() => soundFX.playTap()}
              className="arcade-btn-gold py-4 px-8 rounded-2xl text-base font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Trophy className="h-5 w-5 fill-slate-950 text-slate-950" />
              JUGAR RETO AHORA
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Arcade Rules Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl game-panel p-4 flex items-center gap-3 border-amber-500/30">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">1 Intento Oficial</h4>
            <span className="text-[11px] text-slate-400 font-medium">Puntúa para el podio global</span>
          </div>
        </div>

        <div className="rounded-2xl game-panel p-4 flex items-center gap-3 border-emerald-500/30">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">+200 XP Extra</h4>
            <span className="text-[11px] text-slate-400 font-medium">Mantiene tu racha de días</span>
          </div>
        </div>

        <div className="rounded-2xl game-panel p-4 flex items-center gap-3 border-cyan-500/30">
          <div className="h-12 w-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Reset 00:00 UTC</h4>
            <span className="text-[11px] text-slate-400 font-medium">Nuevo reto cada 24 horas</span>
          </div>
        </div>
      </div>

      {/* Daily Leaderboard */}
      <div className="rounded-3xl game-panel p-6 shadow-xl border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Medal className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Clasificación de Hoy</h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {leaderboard.length} jugadores clasificados
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando clasificación en directo...</div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-black text-slate-200 uppercase">¡Sé el primero en clasificar hoy!</p>
            <p className="text-xs text-slate-400 mt-1">Completa el reto diario para inaugurar el podio del día.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {leaderboard.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between py-3.5 hover:bg-slate-850/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400 font-mono'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-slate-800 overflow-hidden relative border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.avatar} alt={item.username} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">{item.username}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Tiempo: {item.time_taken_seconds}s
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {item.score.toLocaleString()} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
