'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Shield, Medal, Sparkles } from 'lucide-react';
import { soundFX } from '@/lib/audio/sound-effects';

interface RankingUser {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  gamesWon: number;
  bestScore: number;
  dailyStreak: number;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'global' | 'weekly' | 'daily'>('global');
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${tab}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRankings(data.rankings || []);
        }
      })
      .finally(() => setLoading(false));
  }, [tab]);

  const handleTab = (newTab: 'global' | 'weekly' | 'daily') => {
    soundFX.playTap();
    setTab(newTab);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
      {/* Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
            <Trophy className="h-3.5 w-3.5" /> CLASIFICACIÓN MUNDIAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            HALL OF FAME
          </h1>
          <p className="text-xs text-slate-400 mt-1">Los mayores expertos de estadísticas de fútbol del mundo.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1.5 shadow-inner">
          <button
            onClick={() => handleTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'global' ? 'arcade-btn-green scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            Global (XP)
          </button>
          <button
            onClick={() => handleTab('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'weekly' ? 'arcade-btn-green scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => handleTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'daily' ? 'arcade-btn-green scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            Récord
          </button>
        </div>
      </div>

      {/* Podiums Top 3 */}
      {rankings.length >= 3 && !loading && (
        <div className="grid grid-cols-3 gap-3 mb-8 items-end max-w-md mx-auto pt-4">
          {/* Rank 2 (Silver) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 overflow-hidden border-2 border-slate-300 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankings[1].avatar} alt={rankings[1].username} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow">
                2
              </span>
            </div>
            <h4 className="text-xs font-black text-white truncate max-w-[90px] uppercase">{rankings[1].username}</h4>
            <span className="text-[11px] font-black text-slate-300 font-mono">
              {rankings[1].xp.toLocaleString()} XP
            </span>
            <div className="w-full h-16 bg-slate-800 rounded-t-2xl mt-2 border-t-2 border-slate-400" />
          </div>

          {/* Rank 1 (Gold) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="h-20 w-20 rounded-2xl bg-amber-500/20 overflow-hidden border-3 border-amber-400 shadow-2xl shadow-amber-400/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankings[0].avatar} alt={rankings[0].username} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
                1
              </span>
            </div>
            <h4 className="text-sm font-black text-white truncate max-w-[110px] uppercase">{rankings[0].username}</h4>
            <span className="text-xs font-black text-amber-400 font-mono">
              {rankings[0].xp.toLocaleString()} XP
            </span>
            <div className="w-full h-24 bg-gradient-to-t from-amber-950/80 to-amber-500/25 rounded-t-2xl mt-2 border-t-3 border-amber-400 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-amber-400 fill-amber-400" />
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 overflow-hidden border-2 border-amber-700 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankings[2].avatar} alt={rankings[2].username} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow">
                3
              </span>
            </div>
            <h4 className="text-xs font-black text-white truncate max-w-[90px] uppercase">{rankings[2].username}</h4>
            <span className="text-[11px] font-black text-slate-300 font-mono">
              {rankings[2].xp.toLocaleString()} XP
            </span>
            <div className="w-full h-12 bg-slate-800 rounded-t-2xl mt-2 border-t-2 border-amber-700" />
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="rounded-3xl game-panel overflow-hidden shadow-2xl border-slate-800">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Cargando clasificaciones...</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {rankings.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-slate-850/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-950 font-black'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white font-black'
                        : 'bg-slate-800 text-slate-400 font-mono'
                    }`}
                  >
                    {user.rank}
                  </span>

                  <div className="h-10 w-10 rounded-xl bg-slate-800 overflow-hidden relative shrink-0 border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white uppercase leading-tight">{user.username}</h4>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/30">
                        LVL {user.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                      <span>{user.gamesWon}W</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Flame className="h-3.5 w-3.5 fill-amber-400" /> {user.dailyStreak}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono block">
                    {user.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Récord: {user.bestScore.toLocaleString()}
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
