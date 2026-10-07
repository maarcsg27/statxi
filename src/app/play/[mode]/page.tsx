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
  TrendingUp,
  Sparkles,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameType, StatType, STAT_REGISTRY } from '@/lib/game-engine/types';
import { GAME_MODES } from '@/lib/game-engine/modes-data';

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

  // Round Timer Countdown
  useEffect(() => {
    if (loading || roundAnswered || matchFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
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
          setTotalScore((prev) => prev + data.result.scoreAwarded);
          setStreak((prev) => prev + 1);
          setRoundsWon((prev) => prev + 1);
          try {
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
          } catch {}
        } else {
          setStreak(0);
        }
      }
    } catch {
      // Fallback
      setRoundResult({
        isCorrect: false,
        scoreAwarded: 0,
        correctAnswerText: 'No disponible',
        userAnswerText: 'Fallado',
      });
      setStreak(0);
    }
  };

  const handleNextRound = async () => {
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
      // Finish Match
      finishMatch();
    }
  };

  const finishMatch = async () => {
    setMatchFinished(true);
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
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
    const text = `⚽ ¡He sumado ${totalScore.toLocaleString()} PTS en STATXI (${modeInfo.name})! ¿Puedes superarme? Juega en: ${window.location.origin}/play/${modeInfo.type}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <Sparkles className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Preparando el terreno de juego...</h3>
        <p className="mt-1 text-sm text-slate-400">Consultando datos oficiales de jugadores en PostgreSQL</p>
      </div>
    );
  }

  if (error || !currentQ) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <XCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">Error al cargar la partida</h2>
        <p className="mt-2 text-sm text-slate-400">{error || 'No se han encontrado preguntas.'}</p>
        <button
          onClick={() => router.push('/modes')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" /> Volver a Juegos
        </button>
      </div>
    );
  }

  const statMeta = STAT_REGISTRY[currentQ.stat] || { label: currentQ.stat, unit: '' };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Match HUD Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-sm">
            {currentRoundIdx + 1}/{questions.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {modeInfo.name}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                {statMeta.label}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-200">
              Ronda {currentRoundIdx + 1}
            </span>
          </div>
        </div>

        {/* Center: Live Timer Gauge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Timer
              className={`h-5 w-5 ${
                timeLeft <= 4 ? 'text-red-400 animate-ping' : timeLeft <= 8 ? 'text-amber-400' : 'text-cyan-400'
              }`}
            />
            <span
              className={`text-lg font-black font-mono ${
                timeLeft <= 4 ? 'text-red-400' : timeLeft <= 8 ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="w-24 sm:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 4 ? 'bg-red-500' : timeLeft <= 8 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Right: Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-amber-400">
            <Flame className="h-5 w-5 fill-amber-400/20" />
            <span className="text-sm font-bold font-mono">x{streak}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">PUNTOS</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="mb-6 rounded-3xl bg-slate-900 border border-slate-800/80 p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/5 blur-3xl pointer-events-none" />

        <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider">
          {statMeta.label}
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight max-w-2xl mx-auto leading-snug">
          {currentQ.prompt}
        </h1>
      </div>

      {/* Interactive Arena based on Game Type */}
      {!roundAnswered ? (
        <div>
          {/* 1. HIGHER / LOWER 4-OPTIONS */}
          {(currentQ.gameType === 'higher' || currentQ.gameType === 'lower') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.players.map((player) => (
                <button
                  key={player.player_id}
                  onClick={() => {
                    setSelectedPlayerId(player.player_id);
                    submitAnswer({ selectedPlayerId: player.player_id });
                  }}
                  className="group relative flex items-center gap-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-850 hover:shadow-lg hover:shadow-emerald-500/10 text-left cursor-pointer"
                >
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-slate-700/50">
                    {player.photo ? (
                      <Image
                        src={player.photo}
                        alt={player.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500 font-black text-lg">
                        {player.name.substring(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400">
                        {player.position}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 truncate">{player.nationality}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate group-hover:text-emerald-300">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{player.club_name}</p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* 2. HIGHER / LOWER LADDER (2 Players comparison) */}
          {currentQ.gameType === 'higher-lower' && currentQ.players.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Player A (Revealed) */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center">
                <div className="relative h-28 w-28 mx-auto rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 mb-4">
                  {currentQ.players[0].photo && (
                    <Image
                      src={currentQ.players[0].photo}
                      alt={currentQ.players[0].name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="text-xl font-black text-white">{currentQ.players[0].name}</h3>
                <p className="text-xs text-slate-400">{currentQ.players[0].club_name}</p>
                <div className="mt-4 inline-block rounded-xl bg-slate-800 border border-slate-700 px-4 py-2">
                  <span className="text-xs text-slate-400 block font-bold">REGISTRO</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {currentQ.options?.[0]?.value !== undefined
                      ? statMeta.formatValue(currentQ.options[0].value)
                      : 'Descubierto'}
                  </span>
                </div>
              </div>

              {/* Player B (Interactive Guess) */}
              <div className="rounded-3xl bg-slate-900/90 border-2 border-dashed border-emerald-500/40 p-6 text-center">
                <div className="relative h-28 w-28 mx-auto rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/50 mb-4">
                  {currentQ.players[1].photo && (
                    <Image
                      src={currentQ.players[1].photo}
                      alt={currentQ.players[1].name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="text-xl font-black text-white">{currentQ.players[1].name}</h3>
                <p className="text-xs text-slate-400 mb-6">{currentQ.players[1].club_name}</p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => submitAnswer({ choice: 'higher' })}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    ▲ MAYOR
                  </button>
                  <button
                    onClick={() => submitAnswer({ choice: 'lower' })}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-base transition-transform active:scale-95 shadow-lg shadow-rose-500/20"
                  >
                    ▼ MENOR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. EXACT / CLOSEST INPUT */}
          {(currentQ.gameType === 'exact' || currentQ.gameType === 'closest') && currentQ.players[0] && (
            <div className="max-w-md mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center">
              <div className="relative h-28 w-28 mx-auto rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 mb-4">
                {currentQ.players[0].photo && (
                  <Image
                    src={currentQ.players[0].photo}
                    alt={currentQ.players[0].name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <h3 className="text-xl font-black text-white">{currentQ.players[0].name}</h3>
              <p className="text-xs text-slate-400 mb-6">{currentQ.players[0].club_name}</p>

              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Introduce tu pronóstico numérico..."
                  value={numericInput}
                  onChange={(e) => setNumericInput(e.target.value)}
                  className="w-full text-center text-2xl font-black font-mono rounded-2xl bg-slate-950 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                disabled={!numericInput}
                onClick={() => submitAnswer({ numericAnswer: Number(numericInput) })}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-base transition-colors"
              >
                Confirmar Pronóstico
              </button>
            </div>
          )}

          {/* 4. GUESS THE STAT MULTIPLE CHOICE */}
          {currentQ.gameType === 'guess-stat' && (
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-4">
                {currentQ.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitAnswer({ numericAnswer: opt.value })}
                    className="py-4 px-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-850 font-black font-mono text-xl text-white hover:text-emerald-300 transition-all cursor-pointer"
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
              <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3 border border-slate-700">
                <span className="text-sm font-semibold text-slate-300">
                  {currentQ.gameType === 'limit'
                    ? `Tope Límite: ${currentQ.limitValue}`
                    : `Objetivo: ${currentQ.targetValue}`}
                </span>
                <button
                  disabled={selectedMultiIds.length === 0}
                  onClick={() => submitAnswer({ selectedPlayerIds: selectedMultiIds })}
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
                >
                  Enviar Selección ({selectedMultiIds.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentQ.players.map((p) => {
                  const isSelected = selectedMultiIds.includes(p.player_id);
                  return (
                    <button
                      key={p.player_id}
                      onClick={() => {
                        setSelectedMultiIds((prev) =>
                          isSelected ? prev.filter((id) => id !== p.player_id) : [...prev, p.player_id]
                        );
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-lg bg-slate-800 relative overflow-hidden shrink-0">
                        {p.photo && <Image src={p.photo} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                        <span className="text-[11px] text-slate-400">{p.club_name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Round Result Feedback Banner */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center animate-fadeIn shadow-2xl">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4 ${
              roundResult?.isCorrect
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {roundResult?.isCorrect ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <XCircle className="h-8 w-8" />
            )}
          </div>

          <h2 className="text-2xl font-black text-white">
            {roundResult?.isCorrect ? '¡CORRECTO!' : 'FALLO'}
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            Respuesta oficial: <strong className="text-emerald-400">{roundResult?.correctAnswerText}</strong>
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 border border-slate-700">
            <span className="text-xs text-slate-400 font-bold">Puntos ronda:</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              +{roundResult?.scoreAwarded.toLocaleString()}
            </span>
          </div>

          <div className="mt-8">
            <button
              onClick={handleNextRound}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3.5 text-base font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              {currentRoundIdx + 1 < questions.length ? 'Siguiente Ronda' : 'Ver Resultado Final'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Match Finished Modal */}
      {matchFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center shadow-2xl relative overflow-hidden animate-scaleUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 mb-4">
              <Trophy className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black text-white">¡Partida Completada!</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mt-1">
              {modeInfo.name} • STATXI
            </p>

            {/* Score Banner */}
            <div className="my-6 rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                PUNTUACIÓN TOTAL
              </span>
              <div className="text-4xl font-black text-white font-mono mt-1">
                {totalScore.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center justify-center gap-3 text-xs">
                <span className="text-slate-400">
                  Aciertos: <strong className="text-slate-200">{roundsWon}/{questions.length}</strong>
                </span>
                <span className="text-emerald-400 font-bold">+{xpEarned} XP</span>
              </div>
            </div>

            {/* Unlocked Achievements */}
            {newlyUnlocked.length > 0 && (
              <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  ¡Nuevo Logro Desbloqueado!
                </div>
                <div className="text-xs text-amber-200/80 mt-1">
                  Has ganado recompensas de nivel y medallas en tu perfil.
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm transition-colors border border-slate-700"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
                {copiedShare ? '¡Copiado al portapapeles!' : 'Compartir con Amigos'}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-colors shadow-lg shadow-emerald-500/20"
              >
                Jugar Otra Partida
              </button>

              <Link
                href="/modes"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 py-2"
              >
                Explorar otros minijuegos
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
