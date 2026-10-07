'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Share2, Play, Trophy, Check, Copy } from 'lucide-react';
import { GameType, StatType, Difficulty, STAT_REGISTRY } from '@/lib/game-engine/types';
import { GAME_MODES } from '@/lib/game-engine/modes-data';

export default function CustomGamePage() {
  const router = useRouter();
  const [gameType, setGameType] = useState<GameType>('higher');
  const [stat, setStat] = useState<StatType>('goals');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [rounds, setRounds] = useState(5);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const url = `${window.location.origin}/game/${code}?type=${gameType}&stat=${stat}&diff=${difficulty}&rounds=${rounds}`;
    setShareUrl(url);
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> MODO PERSONALIZADO
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Crea tu Partida a Medida
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configura tus propias reglas, estadísticas y dificultad, y reta a tus amigos con un enlace único.
        </p>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Game Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Modo de Juego
          </label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value as GameType)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            {GAME_MODES.map((m) => (
              <option key={m.type} value={m.type}>
                {m.name} — {m.description}
              </option>
            ))}
          </select>
        </div>

        {/* Statistic */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Estadística Principal
          </label>
          <select
            value={stat}
            onChange={(e) => setStat(e.target.value as StatType)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            {Object.values(STAT_REGISTRY).map((meta) => (
              <option key={meta.key} value={meta.key}>
                {meta.label} ({meta.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Nivel de Dificultad
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                  difficulty === d
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : d === 'hard' ? 'Difícil' : 'Experto'}
              </button>
            ))}
          </div>
        </div>

        {/* Rounds Slider */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Número de Rondas</span>
            <span className="text-emerald-400 font-mono text-sm">{rounds} rondas</span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
          >
            <Share2 className="h-4 w-4" /> Generar Enlace de Partida
          </button>
        </div>

        {/* Generated Link Result */}
        {shareUrl && (
          <div className="mt-6 rounded-2xl bg-slate-950 border border-emerald-500/40 p-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              ¡Enlace Listo para Compartir!
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <button
              onClick={() => router.push(shareUrl)}
              className="mt-3 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Play className="h-3.5 w-3.5 text-emerald-400" /> Jugar esta configuración ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
