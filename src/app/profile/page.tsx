'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Flame,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { UserProfile, Achievement } from '@/lib/db/types';

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('statxi_user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    const userIdParam = userObj?.id ? `?userId=${userObj.id}` : '';

    fetch(`/api/profile${userIdParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.profile);
          setAchievements(data.achievements || []);
          localStorage.setItem('statxi_user', JSON.stringify(data.profile));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="mx-auto max-w-4xl py-20 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
          <Sparkles className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-4 text-sm text-slate-400">Cargando perfil de jugador...</p>
      </div>
    );
  }

  // Calculate XP towards next level
  const nextLevelXp = Math.pow(profile.level, 2) * 100;
  const currentLevelBaseXp = Math.pow(profile.level - 1, 2) * 100;
  const xpInCurrentLevel = Math.max(0, profile.xp - currentLevelBaseXp);
  const xpNeededForLevel = Math.max(100, nextLevelXp - currentLevelBaseXp);
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));

  const winRate =
    profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;
  const avgScore =
    profile.games_played > 0 ? Math.round(profile.total_score / profile.games_played) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Card Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl bg-slate-800 overflow-hidden border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatar} alt={profile.username} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900">
              {profile.level}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.username}</h1>
              {profile.is_guest && (
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-700">
                  Invitado
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400 font-bold mt-1">
              Nivel {profile.level} • {profile.xp.toLocaleString()} XP Totales
            </p>

            {/* Level XP Progress Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                <span>Progreso Nivel {profile.level + 1}</span>
                <span className="text-emerald-400">{xpPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Streak Counter */}
          <div className="flex sm:flex-col items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 shrink-0">
            <Flame className="h-8 w-8 text-amber-400 fill-amber-400/20 animate-bounce" />
            <div className="text-center ml-3 sm:ml-0 sm:mt-1">
              <span className="text-2xl font-black text-amber-300 font-mono block">
                {profile.daily_streak}
              </span>
              <span className="text-[10px] font-bold uppercase text-amber-400/80">Racha Días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PARTIDAS</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {profile.games_played}
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">{profile.games_won} victorias</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">EFECTIVIDAD</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {winRate}%
          </span>
          <span className="text-[11px] text-slate-400">Porcentaje de éxito</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MEJOR RÉCORD</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
            {profile.best_score.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">Puntos en un juego</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MEDIA POR PARTIDA</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {avgScore.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">Promedio general</span>
        </div>
      </div>

      {/* Achievements Badges */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">LOGROS & MEDALLAS</h2>
            <p className="text-xs text-slate-400">
              Desbloquea hitos históricos demostrando tu conocimiento
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} Desbloqueados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'bg-slate-850/80 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-60'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                  ach.unlocked
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {ach.unlocked ? <CheckCircle2 className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate">{ach.name}</h4>
                  <span className="text-[10px] font-black text-emerald-400 font-mono">
                    +{ach.xp_reward} XP
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
