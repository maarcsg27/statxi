'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameType, StatType, STAT_REGISTRY, Difficulty } from '@/lib/game-engine/types';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import PlayerCardClean from '@/components/PlayerCardClean';
import { soundFX } from '@/lib/audio/sound-effects';

interface SanitizedPlayer {
  player_id: string;
  name: string;
  position: string;
  nationality: string;
  club_name?: string | null;
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
  tolerance?: number;
  options?: Array<{ playerId: string; label: string; value?: number; statKey?: StatType }>;
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
  const searchParams = useSearchParams();

  const modeInfo = GAME_MODES.find((m) => m.type === rawMode) || GAME_MODES[0];

  // Custom configurations from URL query params (from Custom Game Studio)
  const customStat = searchParams.get('stat') as StatType | null;
  const customDiff = (searchParams.get('diff') as Difficulty) || 'medium';
  const customRounds = searchParams.get('rounds') ? Number(searchParams.get('rounds')) : (modeInfo.defaultRounds || 5);
  const customTime = searchParams.get('time') ? Number(searchParams.get('time')) : (modeInfo.defaultTimeLimitSeconds || 15);
  const customCount = searchParams.get('count') ? Number(searchParams.get('count')) : (modeInfo.formats?.[0] || 4);
  const customComp = searchParams.get('comp') || undefined;
  const customSeed = searchParams.get('seed') || undefined;

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
  const [orderedPlayerIds, setOrderedPlayerIds] = useState<string[]>([]);
  const [numericInput, setNumericInput] = useState<string>('');

  // Timer & Scoring
  const timeLimit = customTime || modeInfo.defaultTimeLimitSeconds || 15;
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
            stat: customStat || undefined,
            difficulty: customDiff,
            rounds: customRounds,
            format: customCount,
            competitionId: customComp,
            seed: customSeed,
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
  }, [modeInfo, timeLimit, customStat, customDiff, customRounds, customCount, customComp, customSeed]);

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
    orderedPlayerIds?: string[];
    selectedStatKey?: StatType;
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
            orderedPlayerIds: payload.orderedPlayerIds,
            selectedStatKey: payload.selectedStatKey,
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
      setOrderedPlayerIds([]);
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
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border-2 border-emerald-400 text-emerald-400 shadow-2xl">
          <Sparkles className="h-10 w-10 animate-spin" />
        </div>
        <h3 className="mt-6 text-2xl font-black text-white uppercase tracking-tight text-center">
          Preparando la Ronda
        </h3>
        <p className="mt-1 text-xs text-slate-400 font-mono text-center">
          Obteniendo estadísticas desde PostgreSQL...
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
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24">
      {/* TÍTULO Y HUD CENTRADO */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-4 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
          <span>{modeInfo.name}</span> • <span>Ronda {currentRoundIdx + 1} de {questions.length}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight drop-shadow-md">
          {currentQ.prompt}
        </h1>

        {/* Center Live HUD Bar */}
        <div className="mt-5 flex items-center justify-center gap-6 rounded-2xl bg-slate-900 border border-slate-800 p-3 max-w-md mx-auto shadow-xl">
          {/* Timer */}
          <div className="flex items-center gap-2 font-mono">
            <Timer
              className={`h-5 w-5 ${
                timeLeft <= 4 ? 'text-red-400 animate-bounce' : 'text-cyan-400'
              }`}
            />
            <span
              className={`text-xl font-black ${
                timeLeft <= 4 ? 'text-red-400' : 'text-cyan-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Streak Flame */}
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className="h-5 w-5 fill-amber-400/20" />
            <span className="font-mono text-sm font-black text-amber-300">x{streak}</span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Points */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xs font-bold text-slate-400">PTS:</span>
            <span className="text-xl font-black text-emerald-400">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE ARENA - SIN IMÁGENES DE FUTBOLISTAS */}
      {!roundAnswered ? (
        <div>
          {/* 1. SELECCIÓN DE JUGADOR (HIGHER, LOWER, DRAFT, PLAYER-CHAIN, BATTLE) */}
          {(currentQ.gameType === 'higher' ||
            currentQ.gameType === 'lower' ||
            currentQ.gameType === 'draft' ||
            currentQ.gameType === 'player-chain' ||
            currentQ.gameType === 'battle') && (
            <div className={`grid gap-4 ${
              currentQ.players.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                : currentQ.players.length <= 4
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            }`}>
              {currentQ.players.map((player, idx) => (
                <PlayerCardClean
                  key={player.player_id}
                  name={player.name}
                  position={player.position}
                  nationality={player.nationality}
                  clubName={player.club_name}
                  shirtNumber={idx + 7}
                  variant={idx === 0 ? 'emerald' : idx === 1 ? 'gold' : idx === 2 ? 'cyan' : 'purple'}
                  isSelected={selectedPlayerId === player.player_id}
                  onClick={() => {
                    setSelectedPlayerId(player.player_id);
                    submitAnswer({ selectedPlayerId: player.player_id });
                  }}
                  highlightStat={{
                    label: currentQ.gameType === 'draft' ? 'Fichar para este puesto' : 'Toca para elegir',
                    value: '¿ESTE JUGADOR?',
                  }}
                />
              ))}
            </div>
          )}

          {/* 2. MODO RANKING (ORDENAR JUGADORES DE MAYOR A MENOR) */}
          {currentQ.gameType === 'ranking' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Slots de Orden Seleccionado */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-emerald-400">
                    Tu Orden (De Mayor a Menor)
                  </span>
                  <button
                    onClick={() => {
                      soundFX.playTap();
                      setOrderedPlayerIds([]);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-white uppercase transition-colors"
                  >
                    Reiniciar Selección
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentQ.players.map((_, idx) => {
                    const slottedId = orderedPlayerIds[idx];
                    const slottedPlayer = currentQ.players.find((p) => p.player_id === slottedId);
                    return (
                      <div
                        key={idx}
                        className={`flex-1 min-w-[120px] p-2.5 rounded-xl border text-center ${
                          slottedPlayer
                            ? 'bg-emerald-500/20 border-emerald-400 text-white'
                            : 'bg-slate-950 border-dashed border-slate-700 text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-black block text-emerald-400 mb-0.5">
                          {idx + 1}º PUESTO
                        </span>
                        <span className="text-xs font-bold truncate block">
                          {slottedPlayer ? slottedPlayer.name : 'Vacío'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de Jugadores para Seleccionar en Orden */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentQ.players.map((player) => {
                  const orderIdx = orderedPlayerIds.indexOf(player.player_id);
                  const isPlaced = orderIdx !== -1;
                  return (
                    <button
                      key={player.player_id}
                      disabled={isPlaced}
                      onClick={() => {
                        soundFX.playTap();
                        const nextOrder = [...orderedPlayerIds, player.player_id];
                        setOrderedPlayerIds(nextOrder);
                        if (nextOrder.length === currentQ.players.length) {
                          submitAnswer({ orderedPlayerIds: nextOrder });
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isPlaced
                          ? 'opacity-40 bg-slate-950 border-slate-800'
                          : 'bg-slate-900 border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {player.position}
                        </span>
                        {isPlaced && (
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            #{orderIdx + 1}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-white truncate">{player.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{player.club_name || player.nationality}</div>
                    </button>
                  );
                })}
              </div>

              {orderedPlayerIds.length === currentQ.players.length && (
                <button
                  onClick={() => submitAnswer({ orderedPlayerIds })}
                  className="w-full arcade-btn-green py-4 rounded-2xl text-sm font-black uppercase tracking-wider"
                >
                  CONFIRMAR RANKING
                </button>
              )}
            </div>
          )}

          {/* 3. HIGHER / LOWER LADDER (2 JUGADORES) */}
          {currentQ.gameType === 'higher-lower' && currentQ.players.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center max-w-2xl mx-auto">
              <div>
                <PlayerCardClean
                  name={currentQ.players[0].name}
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

              <div className="space-y-4">
                <PlayerCardClean
                  name={currentQ.players[1].name}
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

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      soundFX.playTap();
                      submitAnswer({ choice: 'higher' });
                    }}
                    className="flex-1 arcade-btn-green py-4 rounded-2xl text-base font-black uppercase cursor-pointer"
                  >
                    ▲ MAYOR
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playTap();
                      submitAnswer({ choice: 'lower' });
                    }}
                    className="flex-1 arcade-btn-red py-4 rounded-2xl text-base font-black uppercase cursor-pointer"
                  >
                    ▼ MENOR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. EXACT / CLOSEST NUMERIC ESTIMATOR */}
          {(currentQ.gameType === 'exact' || currentQ.gameType === 'closest') && currentQ.players[0] && (
            <div className="max-w-md mx-auto">
              <PlayerCardClean
                name={currentQ.players[0].name}
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

              <div className="mt-6 rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Introduce tu pronóstico numérico {currentQ.tolerance ? `(Tolerancia ±${currentQ.tolerance})` : ''}
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

          {/* 5. GUESS THE STAT (OPCIONES DE ESTADÍSTICA) */}
          {currentQ.gameType === 'guess-stat' && currentQ.players[0] && (
            <div className="max-w-md mx-auto space-y-6">
              <PlayerCardClean
                name={currentQ.players[0].name}
                position={currentQ.players[0].position}
                nationality={currentQ.players[0].nationality}
                clubName={currentQ.players[0].club_name}
                variant="cyan"
                isRevealed={true}
                highlightStat={{
                  label: 'Cifra Registrada',
                  value: statMeta.formatValue(currentQ.options?.[0]?.value || 0),
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                {currentQ.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundFX.playTap();
                      submitAnswer({
                        selectedStatKey: opt.statKey,
                        numericAnswer: opt.value,
                      });
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-400 font-bold text-sm text-white hover:text-emerald-300 transition-all cursor-pointer text-center"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. LIMIT / TARGET / SQUAD-DNA ACCUMULATOR */}
          {(currentQ.gameType === 'limit' || currentQ.gameType === 'target' || currentQ.gameType === 'squad-dna') && (
            <div>
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-3.5 border border-emerald-500/30">
                <span className="text-sm font-black uppercase text-white">
                  {currentQ.gameType === 'limit'
                    ? `Tope Límite: ${currentQ.limitValue} ${statMeta.label}`
                    : currentQ.gameType === 'target'
                    ? `Objetivo Exacto: ${currentQ.targetValue} ${statMeta.label}`
                    : `Squad DNA: Selecciona al menos 3 jugadores`}
                </span>
                <button
                  disabled={selectedMultiIds.length === 0}
                  onClick={() => {
                    soundFX.playTap();
                    submitAnswer({ selectedPlayerIds: selectedMultiIds });
                  }}
                  className="arcade-btn-green px-5 py-2 rounded-xl text-xs font-black uppercase disabled:opacity-40"
                >
                  Confirmar ({selectedMultiIds.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentQ.players.map((p, idx) => {
                  const isSelected = selectedMultiIds.includes(p.player_id);
                  return (
                    <PlayerCardClean
                      key={p.player_id}
                      name={p.name}
                      position={p.position}
                      nationality={p.nationality}
                      clubName={p.club_name}
                      shirtNumber={idx + 4}
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
        /* RESULTADO DE LA RONDA */
        <div
          className={`rounded-3xl p-8 text-center shadow-2xl transition-all duration-300 bg-slate-900 border-2 ${
            roundResult?.isCorrect
              ? 'border-emerald-400 shadow-emerald-500/20'
              : 'border-red-500/80 shadow-red-500/20'
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

      {/* MODAL DE FIN DE PARTIDA */}
      {matchFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-emerald-500/50 p-8 text-center shadow-2xl relative overflow-hidden animate-scaleUp">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/30 mb-4">
              <Trophy className="h-10 w-10 fill-slate-950" />
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              ¡PARTIDA FINALIZADA!
            </h2>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mt-1">
              {modeInfo.name} • STATXI
            </p>

            <div className="my-6 rounded-2xl bg-slate-950 border border-slate-800 p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                PUNTUACIÓN TOTAL
              </span>
              <div className="text-5xl font-black text-emerald-400 font-mono mt-1">
                {totalScore.toLocaleString()}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-bold">
                <span className="text-slate-300">
                  Aciertos: <strong className="text-emerald-400">{roundsWon}/{questions.length}</strong>
                </span>
                <span className="text-cyan-400 font-mono">+{xpEarned} XP</span>
              </div>
            </div>

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
