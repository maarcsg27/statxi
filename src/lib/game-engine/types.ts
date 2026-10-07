// =====================================================================
// GAME ENGINE TYPE DEFINITIONS
// Modular game configurations, question types, scoring rules
// =====================================================================

import { GamePlayerPoolRecord } from '../db/types';

export type GameType =
  | 'higher'
  | 'lower'
  | 'exact'
  | 'closest'
  | 'limit'
  | 'target'
  | 'higher-lower'
  | 'guess-stat'
  | 'draft'
  | 'squad-dna'
  | 'player-chain'
  | 'random-challenge';

export type StatType =
  | 'goals'
  | 'assists'
  | 'appearances'
  | 'minutes'
  | 'passes'
  | 'yellow_cards'
  | 'red_cards'
  | 'penalty_goals'
  | 'shots_on_target'
  | 'key_passes'
  | 'dribbles'
  | 'tackles'
  | 'market_value'
  | 'titles'
  | 'world_cup_goals'
  | 'champions_league_goals';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface StatMeta {
  key: StatType;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  formatValue: (val: number) => string;
}

export const STAT_REGISTRY: Record<StatType, StatMeta> = {
  goals: {
    key: 'goals',
    label: 'Goles',
    unit: 'goles',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} goles`,
  },
  assists: {
    key: 'assists',
    label: 'Asistencias',
    unit: 'asistencias',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} asistencias`,
  },
  appearances: {
    key: 'appearances',
    label: 'Partidos Jugados',
    unit: 'partidos',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} PJ`,
  },
  minutes: {
    key: 'minutes',
    label: 'Minutos Jugados',
    unit: 'min',
    higherIsBetter: true,
    formatValue: (v: number) => `${v.toLocaleString()} min`,
  },
  passes: {
    key: 'passes',
    label: 'Pases Totales',
    unit: 'pases',
    higherIsBetter: true,
    formatValue: (v: number) => `${v.toLocaleString()} pases`,
  },
  yellow_cards: {
    key: 'yellow_cards',
    label: 'Tarjetas Amarillas',
    unit: 'amarillas',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} amarillas`,
  },
  red_cards: {
    key: 'red_cards',
    label: 'Tarjetas Rojas',
    unit: 'rojas',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} rojas`,
  },
  penalty_goals: {
    key: 'penalty_goals',
    label: 'Goles de Penalti',
    unit: 'penaltis',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} penaltis`,
  },
  shots_on_target: {
    key: 'shots_on_target',
    label: 'Tiros a Puerta',
    unit: 'tiros',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} tiros a puerta`,
  },
  key_passes: {
    key: 'key_passes',
    label: 'Pases Clave',
    unit: 'pases clave',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} pases clave`,
  },
  dribbles: {
    key: 'dribbles',
    label: 'Regates Completados',
    unit: 'regates',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} regates`,
  },
  tackles: {
    key: 'tackles',
    label: 'Entradas / Recuperaciones',
    unit: 'entradas',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} entradas`,
  },
  market_value: {
    key: 'market_value',
    label: 'Valor de Mercado',
    unit: 'EUR',
    higherIsBetter: true,
    formatValue: (v) => `€${(v / 1_000_000).toFixed(0)}M`,
  },
  titles: {
    key: 'titles',
    label: 'Títulos Ganados',
    unit: 'títulos',
    higherIsBetter: true,
    formatValue: (v) => `${v} títulos`,
  },
  world_cup_goals: {
    key: 'world_cup_goals',
    label: 'Goles en Mundiales',
    unit: 'goles',
    higherIsBetter: true,
    formatValue: (v) => `${v} goles en Mundial`,
  },
  champions_league_goals: {
    key: 'champions_league_goals',
    label: 'Goles en Champions League',
    unit: 'goles',
    higherIsBetter: true,
    formatValue: (v) => `${v} goles en UCL`,
  },
};

export interface GameQuestion {
  id: string;
  roundNumber: number;
  gameType: GameType;
  prompt: string;
  stat: StatType;
  players: GamePlayerPoolRecord[];
  targetValue?: number;
  limitValue?: number;
  options?: Array<{
    playerId: string;
    label: string;
    value?: number;
  }>;
  // Kept server-side or encrypted for fairness
  correctValue?: number;
  correctPlayerId?: string;
}

export interface GameAnswerSubmission {
  questionId: string;
  roundNumber: number;
  selectedPlayerId?: string;
  selectedPlayerIds?: string[];
  numericAnswer?: number;
  choice?: 'higher' | 'lower';
  responseTimeMs: number;
}

export interface AnswerValidationResult {
  questionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  accuracyPercentage?: number;
  correctAnswerText: string;
  userAnswerText: string;
  difference?: number;
  details?: Record<string, unknown>;
}

export interface GameModeInfo {
  type: GameType;
  name: string;
  badge: string;
  description: string;
  defaultRounds: number;
  defaultTimeLimitSeconds: number;
  statPool: StatType[];
  formats: number[]; // e.g. [2, 4, 5, 7, 11]
}
