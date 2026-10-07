'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Flame, ArrowRight, Shield, Clock, Medal } from 'lucide-react';
import { DailyChallengeRecord, DailyChallengeAttemptRecord } from '@/lib/db/types';

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider capitalize">
                {todayFormatted}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {challenge?.title || 'Daily Challenge Oficial'}
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              {challenge?.description ||
                'Un conjunto idéntico de 5 preguntas generado mediante semilla matemática. Compite en igualdad de condiciones con toda la comunidad.'}
            </p>
          </div>

          {challenge && (
            <Link
              href={`/play/${challenge.game_type}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Trophy className="h-5 w-5" />
              JUGAR RETO AHORA
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Rules Pill Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">1 Intento Oficial</h4>
            <span className="text-[11px] text-slate-400">Puntúa para el ranking del día</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">+200 XP Extra</h4>
            <span className="text-[11px] text-slate-400">Recompensa diaria y racha</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Reinicio 00:00 UTC</h4>
            <span className="text-[11px] text-slate-400">Nuevo reto cada 24 horas</span>
          </div>
        </div>
      </div>

      {/* Daily Leaderboard */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-white">Clasificación de Hoy</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {leaderboard.length} jugadores clasificados
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Cargando clasificación...</div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">¡Sé el primero en clasificar hoy!</p>
            <p className="text-xs text-slate-500 mt-1">Completa el reto diario para aparecer en lo más alto del podio.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {leaderboard.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'text-slate-400 font-mono'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-slate-800 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.avatar} alt={item.username} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{item.username}</h4>
                    <span className="text-[10px] text-slate-400">
                      Tiempo: {item.time_taken_seconds}s
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono">
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
