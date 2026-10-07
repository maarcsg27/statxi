'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Timer,
  Trophy,
  Flame,
  ArrowRight,
  RotateCcw,
  Share2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameType, StatType, STAT_REGISTRY } from '@/lib/game-engine/types';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import FutCard from '@/components/FutCard';
import { soundFX } from '@/lib/audio/sound-effects';

interface SanitizedPlayer {
  player_id: string;
  name: string;
  photo?: string | null;
  position: string;
  nationality: string;
  club_name?: string | null;
  club_logo?: string | null;
}

interface QuestionData {
  id: string;
  roundNumber: number;
  gameType: GameType;
  prompt: string;
  stat: StatType;
  players: SanitizedPlayer[];
  limitValue?: number;
  targetValue?: number;
  options?: Array<{ playerId: string; label: string; value?: number }>;
}

interface ValidationResult {
  isCorrect: boolean;
  scoreAwarded: number;
  accuracyPercentage?: number;
  correctAnswerText: string;
  userAnswerText: string;
  difference?: number;
}

export default function PlayArenaPage({ params }: { params: Promise<{ mode: string }> }) {
  const resolvedParams = use(params);
  const rawMode = resolvedParams.mode as GameType;
  const router = useRouter();

  const modeInfo = GAME_MODES.find((m) => m.type === rawMode) || GAME_MODES[0];

  // Game state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);

  // Round interaction
  const [roundAnswered, setRoundAnswered] = useState(false);
  const [roundResult, setRoundResult] = useState<ValidationResult | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [numericInput, setNumericInput] = useState<string>('');

  // Timer & Scoring
  const timeLimit = modeInfo.defaultTimeLimitSeconds || 15;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundsWon, setRoundsWon] = useState(0);

  // Match Finished
  const [matchFinished, setMatchFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  // Initialize match
  useEffect(() => {
    async function startMatch() {
      setLoading(true);
      setError(null);
      try {
        const storedUser = localStorage.getItem('statxi_user');
        const userObj = storedUser ? JSON.parse(storedUser) : null;

        const res = await fetch('/api/games/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameType: modeInfo.type,
            difficulty: 'medium',
            rounds: modeInfo.defaultRounds || 5,
            userId: userObj?.id,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'No se pudo iniciar el juego');

        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setCurrentRoundIdx(0);
        setTimeLeft(timeLimit);
        startTimeRef.current = Date.now();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    startMatch();
  }, [modeInfo, timeLimit]);

  // Round Timer Countdown with Sound Tick
  useEffect(() => {
    if (loading || roundAnswered || matchFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          soundFX.playTick();
        }
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, roundAnswered, currentRoundIdx, matchFinished]);

  const handleTimeExpired = () => {
    if (roundAnswered) return;
    soundFX.playWrong();
    submitAnswer({
      selectedPlayerId: undefined,
      responseTimeMs: timeLimit * 1000,
    });
  };

  const currentQ = questions[currentRoundIdx];

  const submitAnswer = async (payload: {
    selectedPlayerId?: string;
    selectedPlayerIds?: string[];
    numericAnswer?: number;
    choice?: 'higher' | 'lower';
    responseTimeMs?: number;
  }) => {
    if (roundAnswered || !currentQ) return;
    setRoundAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const responseTime = payload.responseTimeMs || Math.min(timeLimit * 1000, Date.now() - startTimeRef.current);

    try {
      const res = await fetch('/api/games/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          submission: {
            questionId: currentQ.id,
            roundNumber: currentQ.roundNumber,
            selectedPlayerId: payload.selectedPlayerId,
            selectedPlayerIds: payload.selectedPlayerIds,
            numericAnswer: payload.numericAnswer,
            choice: payload.choice,
            responseTimeMs: responseTime,
          },
          streakCount: streak,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setRoundResult(data.result);
        if (data.result.isCorrect) {
          soundFX.playCorrect();
          setTotalScore((prev) => prev + data.result.scoreAwarded);
          setStreak((prev) => prev + 1);
          setRoundsWon((prev) => prev + 1);
          try {
            confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
          } catch {}
        } else {
          soundFX.playWrong();
          setStreak(0);
        }
      }
    } catch {
      soundFX.playWrong();
      setRoundResult({
        isCorrect: false,
        scoreAwarded: 0,
        correctAnswerText: 'No disponible',
        userAnswerText: 'Fallo',
      });
      setStreak(0);
    }
  };

  const handleNextRound = async () => {
    soundFX.playTap();
    if (currentRoundIdx + 1 < questions.length) {
      setCurrentRoundIdx((prev) => prev + 1);
      setRoundAnswered(false);
      setRoundResult(null);
      setSelectedPlayerId(null);
      setSelectedMultiIds([]);
      setNumericInput('');
      setTimeLeft(timeLimit);
      startTimeRef.current = Date.now();
    } else {
      finishMatch();
    }
  };

  const finishMatch = async () => {
    setMatchFinished(true);
    soundFX.playVictory();
    try {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    } catch {}

    const storedUser = localStorage.getItem('statxi_user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;

    try {
      const res = await fetch('/api/games/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userObj?.id,
          totalScore,
          isWin: roundsWon >= Math.ceil(questions.length / 2),
          roundsWon,
          totalRounds: questions.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setXpEarned(data.xpEarned);
        setNewlyUnlocked(data.newlyUnlocked || []);
        if (data.profile) {
          localStorage.setItem('statxi_user', JSON.stringify(data.profile));
          window.dispatchEvent(new Event('statxi_profile_updated'));
        }
      }
    } catch {}
  };

  const handleShare = () => {
    soundFX.playTap();
    const text = `⚽ ¡He sumado ${totalScore.toLocaleString()} PTS en STATXI (${modeInfo.name})! ¿Puedes superarme? Juega en: ${window.location.origin}/play/${modeInfo.type}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border-2 border-emerald-400/50 shadow-2xl shadow-emerald-500/25">
          <Sparkles className="h-10 w-10 text-emerald-400 animate-spin" />
        </div>
        <h3 className="mt-6 text-2xl font-black text-white uppercase tracking-tight">
          Cargando Terreno de Juego
        </h3>
        <p className="mt-1 text-xs text-slate-400 font-mono">
          Verificando estadísticas en PostgreSQL...
        </p>
      </div>
    );
  }

  if (error || !currentQ) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
          <XCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-white uppercase">Error en la Partida</h2>
        <p className="mt-2 text-xs text-slate-400">{error || 'No se han encontrado preguntas.'}</p>
        <button
          onClick={() => router.push('/modes')}
          className="mt-6 arcade-btn-green py-3 px-6 rounded-xl text-xs font-black uppercase cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 inline mr-2" /> Volver al Menú
        </button>
      </div>
    );
  }

  const statMeta = STAT_REGISTRY[currentQ.stat] || { label: currentQ.stat, unit: '' };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 pb-20">
      {/* ARENA BATTLE HUD */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl game-panel p-4 shadow-2xl border-emerald-500/20">
        {/* Round Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/25">
            {currentRoundIdx + 1}/{questions.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {modeInfo.name}
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                {statMeta.label}
              </span>
            </div>
            <span className="text-base font-black text-white uppercase tracking-tight">
              Ronda {currentRoundIdx + 1}
            </span>
          </div>
        </div>

        {/* Center: Live Timer Gauge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Timer
              className={`h-6 w-6 ${
                timeLeft <= 4 ? 'text-red-400 animate-bounce' : timeLeft <= 8 ? 'text-amber-400' : 'text-cyan-400'
              }`}
            />
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                timeLeft <= 4 ? 'text-red-400 animate-pulse' : timeLeft <= 8 ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="w-24 sm:w-36 h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 4 ? 'bg-red-500' : timeLeft <= 8 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              }`}
              style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Right: Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1 border border-amber-500/40">
            <Flame className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-sm font-black text-amber-300 font-mono">x{streak}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">PUNTOS</span>
            <span className="text-2xl font-black text-emerald-400 font-mono leading-none drop-shadow">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ARENA PROMPT BANNER */}
      <div className="mb-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-emerald-500/10 blur-3xl" />

        <div className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 mb-3">
          ⚡ {statMeta.label}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight max-w-3xl mx-auto leading-tight drop-shadow-md">
          {currentQ.prompt}
        </h1>
      </div>

      {/* INTERACTIVE ARENA PLAYFIELD */}
      {!roundAnswered ? (
        <div>
          {/* 1. HIGHER / LOWER 4 FUT CARDS GRID */}
          {(currentQ.gameType === 'higher' || currentQ.gameType === 'lower') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {currentQ.players.map((player, idx) => (
                <FutCard
                  key={player.player_id}
                  name={player.name}
                  photo={player.photo}
                  position={player.position}
                  nationality={player.nationality}
                  clubName={player.club_name}
                  clubLogo={player.club_logo}
                  variant={idx === 0 ? 'emerald' : idx === 1 ? 'gold' : idx === 2 ? 'cyan' : 'purple'}
                  isSelected={selectedPlayerId === player.player_id}
                  onClick={() => {
                    setSelectedPlayerId(player.player_id);
                    submitAnswer({ selectedPlayerId: player.player_id });
                  }}
                  highlightStat={{
                    label: 'Toca para elegir',
                    value: '¿MÁS ALTO?',
                  }}
                />
              ))}
            </div>
          )}

          {/* 2. HIGHER / LOWER LADDER (2 FUT Cards VS Battle) */}
          {currentQ.gameType === 'higher-lower' && currentQ.players.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-2xl mx-auto">
              {/* Card A: Revealed Stat */}
              <div>
                <FutCard
                  name={currentQ.players[0].name}
                  photo={currentQ.players[0].photo}
                  position={currentQ.players[0].position}
                  nationality={currentQ.players[0].nationality}
                  clubName={currentQ.players[0].club_name}
                  variant="emerald"
                  isRevealed={true}
                  highlightStat={{
                    label: statMeta.label,
                    value:
                      currentQ.options?.[0]?.value !== undefined
                        ? statMeta.formatValue(currentQ.options[0].value)
                        : 'Descubierto',
                  }}
                />
              </div>

              {/* Card B: Higher or Lower Choice */}
              <div className="space-y-4">
                <FutCard
                  name={currentQ.players[1].name}
                  photo={currentQ.players[1].photo}
                  position={currentQ.players[1].position}
                  nationality={currentQ.players[1].nationality}
                  clubName={currentQ.players[1].club_name}
                  variant="gold"
                  isRevealed={false}
                  highlightStat={{
                    label: '¿Tiene más o menos?',
                    value: '???',
                  }}
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      soundFX.playTap();
                      submitAnswer({ choice: 'higher' });
                    }}
                    className="flex-1 arcade-btn-green py-4 rounded-2xl text-lg font-black uppercase cursor-pointer"
                  >
                    ▲ MAYOR
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playTap();
                      submitAnswer({ choice: 'lower' });
                    }}
                    className="flex-1 arcade-btn-red py-4 rounded-2xl text-lg font-black uppercase cursor-pointer"
                  >
                    ▼ MENOR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. EXACT / CLOSEST NUMERIC ESTIMATOR */}
          {(currentQ.gameType === 'exact' || currentQ.gameType === 'closest') && currentQ.players[0] && (
            <div className="max-w-md mx-auto">
              <FutCard
                name={currentQ.players[0].name}
                photo={currentQ.players[0].photo}
                position={currentQ.players[0].position}
                nationality={currentQ.players[0].nationality}
                clubName={currentQ.players[0].club_name}
                variant="gold"
                isRevealed={false}
                highlightStat={{
                  label: statMeta.label,
                  value: '???',
                }}
              />

              <div className="mt-6 game-panel rounded-3xl p-6 text-center border-slate-800">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Introduce tu pronóstico numérico
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={numericInput}
                  onChange={(e) => setNumericInput(e.target.value)}
                  className="w-full text-center text-4xl font-black font-mono rounded-2xl bg-slate-950 border-2 border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                />

                <button
                  disabled={!numericInput}
                  onClick={() => {
                    soundFX.playTap();
                    submitAnswer({ numericAnswer: Number(numericInput) });
                  }}
                  className="mt-4 w-full arcade-btn-green py-4 rounded-2xl text-base font-black uppercase cursor-pointer disabled:opacity-40"
                >
                  CONFIRMAR PRONÓSTICO
                </button>
              </div>
            </div>
          )}

          {/* 4. GUESS THE STAT 4 ARCADE BUTTONS */}
          {currentQ.gameType === 'guess-stat' && currentQ.players[0] && (
            <div className="max-w-md mx-auto space-y-6">
              <FutCard
                name={currentQ.players[0].name}
                photo={currentQ.players[0].photo}
                position={currentQ.players[0].position}
                nationality={currentQ.players[0].nationality}
                clubName={currentQ.players[0].club_name}
                variant="cyan"
                isRevealed={false}
                highlightStat={{
                  label: 'Elige la cifra correcta',
                  value: '???',
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                {currentQ.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundFX.playTap();
                      submitAnswer({ numericAnswer: opt.value });
                    }}
                    className="game-panel hover:game-panel-glow py-4 px-4 rounded-2xl font-mono text-xl font-black text-white hover:text-emerald-300 transition-all cursor-pointer text-center"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. LIMIT / TARGET ACCUMULATOR */}
          {(currentQ.gameType === 'limit' || currentQ.gameType === 'target') && (
            <div>
              <div className="mb-4 flex items-center justify-between rounded-2xl game-panel px-5 py-3.5 border-emerald-500/30">
                <span className="text-sm font-black uppercase text-white">
                  {currentQ.gameType === 'limit'
                    ? `Tope Límite: ${currentQ.limitValue} ${statMeta.label}`
                    : `Objetivo Exacto: ${currentQ.targetValue} ${statMeta.label}`}
                </span>
                <button
                  disabled={selectedMultiIds.length === 0}
                  onClick={() => {
                    soundFX.playTap();
                    submitAnswer({ selectedPlayerIds: selectedMultiIds });
                  }}
                  className="arcade-btn-green px-5 py-2 rounded-xl text-xs font-black uppercase disabled:opacity-40"
                >
                  Confirmar Selección ({selectedMultiIds.length})
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentQ.players.map((p) => {
                  const isSelected = selectedMultiIds.includes(p.player_id);
                  return (
                    <FutCard
                      key={p.player_id}
                      name={p.name}
                      photo={p.photo}
                      position={p.position}
                      nationality={p.nationality}
                      clubName={p.club_name}
                      variant={isSelected ? 'emerald' : 'gold'}
                      isSelected={isSelected}
                      onClick={() => {
                        setSelectedMultiIds((prev) =>
                          isSelected ? prev.filter((id) => id !== p.player_id) : [...prev, p.player_id]
                        );
                      }}
                      highlightStat={{
                        label: isSelected ? 'SELECCIONADO' : 'Toca para sumar',
                        value: isSelected ? 'AÑADIDO' : '+ SUMAR',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ARCADE RESULT REVEAL BANNER */
        <div
          className={`rounded-3xl p-8 text-center shadow-2xl transition-all duration-300 ${
            roundResult?.isCorrect
              ? 'game-panel-glow border-emerald-400/80 animate-scaleUp'
              : 'game-panel border-red-500/60 animate-shake'
          }`}
        >
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl mb-4 shadow-xl ${
              roundResult?.isCorrect
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40'
                : 'bg-red-500 text-white shadow-red-500/40'
            }`}
          >
            {roundResult?.isCorrect ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {roundResult?.isCorrect ? '¡CORRECTO!' : 'FALLO'}
          </h2>

          <p className="mt-2 text-sm text-slate-300 font-medium">
            Respuesta oficial: <strong className="text-emerald-400">{roundResult?.correctAnswerText}</strong>
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-950 border border-emerald-500/40 px-5 py-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Puntos Ganados:</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              +{roundResult?.scoreAwarded.toLocaleString()} PTS
            </span>
          </div>

          <div className="mt-8">
            <button
              onClick={handleNextRound}
              className="arcade-btn-green py-4 px-10 rounded-2xl text-base font-black uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              {currentRoundIdx + 1 < questions.length ? 'SIGUIENTE RONDA' : 'VER RESULTADO FINAL'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* MATCH FINISHED CELEBRATION MODAL */}
      {matchFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
          <div className="w-full max-w-md rounded-3xl game-panel-glow p-8 text-center shadow-2xl relative overflow-hidden animate-scaleUp">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/30 mb-4">
              <Trophy className="h-10 w-10 fill-slate-950" />
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              ¡PARTIDA FINALIZADA!
            </h2>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mt-1">
              {modeInfo.name} • STATXI
            </p>

            {/* Score Showcase */}
            <div className="my-6 rounded-2xl bg-slate-950 border border-slate-800 p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                PUNTUACIÓN TOTAL
              </span>
              <div className="text-5xl font-black text-emerald-400 font-mono mt-1 drop-shadow">
                {totalScore.toLocaleString()}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-bold">
                <span className="text-slate-300">
                  Aciertos: <strong className="text-emerald-400">{roundsWon}/{questions.length}</strong>
                </span>
                <span className="text-cyan-400 font-mono">+{xpEarned} XP</span>
              </div>
            </div>

            {/* Achievements */}
            {newlyUnlocked.length > 0 && (
              <div className="mb-6 rounded-2xl bg-amber-500/15 border border-amber-500/40 p-3.5 text-left">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  ¡NUEVA MEDALLA DESBLOQUEADA!
                </div>
                <div className="text-xs text-amber-200/90 mt-1">
                  Has sumado bonificación de XP en tu perfil de jugador.
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
                {copiedShare ? '¡ENLACE COPIADO!' : 'COMPARTIR RESULTADO'}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full arcade-btn-green py-4 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer"
              >
                JUGAR DE NUEVO
              </button>

              <Link
                href="/modes"
                className="text-xs font-bold uppercase text-slate-400 hover:text-white py-2"
              >
                Elegir otro modo de juego
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
