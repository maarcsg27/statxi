'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Shield, Medal, Sparkles } from 'lucide-react';

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-2">
            <Trophy className="h-3.5 w-3.5" /> CLASIFICACIÓN MUNDIAL
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Hall of Fame STATXI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Los mejores analistas y jugadores de fútbol del planeta.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setTab('global')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === 'global' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Global (XP)
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === 'weekly' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setTab('daily')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === 'daily' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Récord (Score)
          </button>
        </div>
      </div>

      {/* Podiums Top 3 */}
      {rankings.length >= 3 && !loading && (
        <div className="grid grid-cols-3 gap-3 mb-8 items-end max-w-lg mx-auto pt-6">
          {/* Rank 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="h-14 w-14 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankings[1].avatar} alt={rankings[1].username} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] flex items-center justify-center border-2 border-slate-900">
                2
              </span>
            </div>
            <h4 className="text-xs font-bold text-white truncate max-w-[90px]">{rankings[1].username}</h4>
            <span className="text-[11px] font-black text-slate-400 font-mono">
              {rankings[1].xp.toLocaleString()} XP
            </span>
            <div className="w-full h-16 bg-slate-800/80 rounded-t-xl mt-2 border-t border-slate-700/50" />
          </div>

          {/* Rank 1 (Gold) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="h-20 w-20 rounded-full bg-amber-500/20 overflow-hidden border-3 border-amber-400 shadow-xl shadow-amber-400/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankings[0].avatar} alt={rankings[0].username} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900">
                1
              </span>
            </div>
            <h4 className="text-sm font-black text-white truncate max-w-[110px]">{rankings[0].username}</h4>
            <span className="text-xs font-black text-amber-400 font-mono">
              {rankings[0].xp.toLocaleString()} XP
            </span>
            <div className="w-full h-24 bg-gradient-to-t from-emerald-950/60 to-emerald-500/20 rounded-t-xl mt-2 border-t-2 border-amber-400 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="h-14 w-14 rounded-full bg-slate-700 overflow-hidden border-2 border-amber-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankings[2].avatar} alt={rankings[2].username} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center border-2 border-slate-900">
                3
              </span>
            </div>
            <h4 className="text-xs font-bold text-white truncate max-w-[90px]">{rankings[2].username}</h4>
            <span className="text-[11px] font-black text-slate-400 font-mono">
              {rankings[2].xp.toLocaleString()} XP
            </span>
            <div className="w-full h-12 bg-slate-800/80 rounded-t-xl mt-2 border-t border-slate-700/50" />
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Cargando clasificaciones...</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {rankings.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400 font-mono'
                    }`}
                  >
                    {user.rank}
                  </span>

                  <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white leading-tight">{user.username}</h4>
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-black text-emerald-400">
                        LVL {user.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{user.gamesWon} Victorias</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Flame className="h-3 w-3 fill-amber-400" /> {user.dailyStreak}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 font-mono block">
                    {user.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[10px] text-slate-500">
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
