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
  | 'random-challenge'
  | 'battle'
  | 'ranking';

export type StatCategoryKey =
  | 'ataque'
  | 'pase'
  | 'defensa'
  | 'disciplina'
  | 'porteros'
  | 'carrera'
  | 'mercado';

export type StatType =
  // Ataque
  | 'goals'
  | 'assists'
  | 'shots'
  | 'shots_on_target'
  | 'penalty_goals'
  | 'penalty_missed'
  | 'goals_per_match'
  // Pase
  | 'passes'
  | 'key_passes'
  | 'pass_accuracy'
  // Defensa
  | 'tackles'
  | 'interceptions'
  | 'duels'
  | 'duels_won'
  | 'fouls_committed'
  | 'fouls_drawn'
  | 'dribbles'
  // Disciplina
  | 'yellow_cards'
  | 'red_cards'
  // Porteros
  | 'saves'
  | 'clean_sheets'
  | 'goals_conceded'
  // Carrera
  | 'appearances'
  | 'minutes'
  | 'titles'
  | 'national_team_goals'
  | 'world_cup_goals'
  | 'champions_league_goals'
  // Mercado
  | 'market_value'
  | 'highest_market_value';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface StatMeta {
  key: StatType;
  label: string;
  unit: string;
  category: StatCategoryKey;
  higherIsBetter: boolean;
  formatValue: (val: number) => string;
}

export interface StatCategoryInfo {
  key: StatCategoryKey;
  name: string;
  icon: string;
  stats: StatType[];
}

export const STAT_CATEGORIES: StatCategoryInfo[] = [
  {
    key: 'ataque',
    name: 'Ataque',
    icon: 'flame',
    stats: ['goals', 'assists', 'shots', 'shots_on_target', 'penalty_goals', 'penalty_missed', 'goals_per_match'],
  },
  {
    key: 'pase',
    name: 'Pase',
    icon: 'send',
    stats: ['passes', 'key_passes', 'pass_accuracy'],
  },
  {
    key: 'defensa',
    name: 'Defensa',
    icon: 'shield',
    stats: ['tackles', 'interceptions', 'duels', 'duels_won', 'fouls_committed', 'fouls_drawn', 'dribbles'],
  },
  {
    key: 'disciplina',
    name: 'Disciplina',
    icon: 'alert-triangle',
    stats: ['yellow_cards', 'red_cards'],
  },
  {
    key: 'porteros',
    name: 'Porteros',
    icon: 'hand',
    stats: ['saves', 'clean_sheets', 'goals_conceded'],
  },
  {
    key: 'carrera',
    name: 'Carrera',
    icon: 'award',
    stats: ['appearances', 'minutes', 'titles', 'national_team_goals', 'world_cup_goals', 'champions_league_goals'],
  },
  {
    key: 'mercado',
    name: 'Mercado',
    icon: 'dollar-sign',
    stats: ['market_value', 'highest_market_value'],
  },
];

export const STAT_REGISTRY: Record<StatType, StatMeta> = {
  // Ataque
  goals: {
    key: 'goals',
    label: 'Goles',
    unit: 'goles',
    category: 'ataque',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} goles`,
  },
  assists: {
    key: 'assists',
    label: 'Asistencias',
    unit: 'asistencias',
    category: 'ataque',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} asistencias`,
  },
  shots: {
    key: 'shots',
    label: 'Tiros Totales',
    unit: 'tiros',
    category: 'ataque',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} tiros`,
  },
  shots_on_target: {
    key: 'shots_on_target',
    label: 'Tiros a Puerta',
    unit: 'a puerta',
    category: 'ataque',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} a puerta`,
  },
  penalty_goals: {
    key: 'penalty_goals',
    label: 'Penaltis Marcados',
    unit: 'penaltis marcados',
    category: 'ataque',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} penaltis`,
  },
  penalty_missed: {
    key: 'penalty_missed',
    label: 'Penaltis Fallados',
    unit: 'fallados',
    category: 'ataque',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} fallados`,
  },
  goals_per_match: {
    key: 'goals_per_match',
    label: 'Goles por Partido',
    unit: 'g/p',
    category: 'ataque',
    higherIsBetter: true,
    formatValue: (v: number) => `${v.toFixed(2)} g/p`,
  },

  // Pase
  passes: {
    key: 'passes',
    label: 'Pases Totales',
    unit: 'pases',
    category: 'pase',
    higherIsBetter: true,
    formatValue: (v: number) => `${v.toLocaleString()} pases`,
  },
  key_passes: {
    key: 'key_passes',
    label: 'Pases Clave',
    unit: 'pases clave',
    category: 'pase',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} pases clave`,
  },
  pass_accuracy: {
    key: 'pass_accuracy',
    label: 'Precisión de Pase',
    unit: '%',
    category: 'pase',
    higherIsBetter: true,
    formatValue: (v: number) => `${v.toFixed(1)}%`,
  },

  // Defensa
  tackles: {
    key: 'tackles',
    label: 'Entradas con Éxito',
    unit: 'entradas',
    category: 'defensa',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} entradas`,
  },
  interceptions: {
    key: 'interceptions',
    label: 'Intercepciones',
    unit: 'intercepciones',
    category: 'defensa',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} intercepciones`,
  },
  duels: {
    key: 'duels',
    label: 'Duelos Totales',
    unit: 'duelos',
    category: 'defensa',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} duelos`,
  },
  duels_won: {
    key: 'duels_won',
    label: 'Duelos Ganados',
    unit: 'duelos ganados',
    category: 'defensa',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} ganados`,
  },
  fouls_committed: {
    key: 'fouls_committed',
    label: 'Faltas Cometidas',
    unit: 'faltas',
    category: 'defensa',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} faltas`,
  },
  fouls_drawn: {
    key: 'fouls_drawn',
    label: 'Faltas Recibidas',
    unit: 'faltas recibidas',
    category: 'defensa',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} faltas recibidas`,
  },
  dribbles: {
    key: 'dribbles',
    label: 'Regates Completados',
    unit: 'regates',
    category: 'defensa',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} regates`,
  },

  // Disciplina
  yellow_cards: {
    key: 'yellow_cards',
    label: 'Tarjetas Amarillas',
    unit: 'amarillas',
    category: 'disciplina',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} amarillas`,
  },
  red_cards: {
    key: 'red_cards',
    label: 'Tarjetas Rojas',
    unit: 'rojas',
    category: 'disciplina',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} rojas`,
  },

  // Porteros
  saves: {
    key: 'saves',
    label: 'Paradas Realizadas',
    unit: 'paradas',
    category: 'porteros',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} paradas`,
  },
  clean_sheets: {
    key: 'clean_sheets',
    label: 'Porterías a Cero',
    unit: 'porterías a cero',
    category: 'porteros',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} a cero`,
  },
  goals_conceded: {
    key: 'goals_conceded',
    label: 'Goles Encajados',
    unit: 'encajados',
    category: 'porteros',
    higherIsBetter: false,
    formatValue: (v: number) => `${v} encajados`,
  },

  // Carrera
  appearances: {
    key: 'appearances',
    label: 'Partidos Jugados',
    unit: 'partidos',
    category: 'carrera',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} PJ`,
  },
  minutes: {
    key: 'minutes',
    label: 'Minutos Jugados',
    unit: 'min',
    category: 'carrera',
    higherIsBetter: true,
    formatValue: (v: number) => `${v.toLocaleString()} min`,
  },
  titles: {
    key: 'titles',
    label: 'Títulos Ganados',
    unit: 'títulos',
    category: 'carrera',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} títulos`,
  },
  national_team_goals: {
    key: 'national_team_goals',
    label: 'Goles Internacionales',
    unit: 'goles selección',
    category: 'carrera',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} con selección`,
  },
  world_cup_goals: {
    key: 'world_cup_goals',
    label: 'Goles en Mundial',
    unit: 'goles Mundial',
    category: 'carrera',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} en Mundial`,
  },
  champions_league_goals: {
    key: 'champions_league_goals',
    label: 'Goles en Champions',
    unit: 'goles UCL',
    category: 'carrera',
    higherIsBetter: true,
    formatValue: (v: number) => `${v} en UCL`,
  },

  // Mercado
  market_value: {
    key: 'market_value',
    label: 'Valor de Mercado Actual',
    unit: 'EUR',
    category: 'mercado',
    higherIsBetter: true,
    formatValue: (v: number) => `€${(v / 1_000_000).toFixed(0)}M`,
  },
  highest_market_value: {
    key: 'highest_market_value',
    label: 'Valor Máximo Histórico',
    unit: 'EUR',
    category: 'mercado',
    higherIsBetter: true,
    formatValue: (v: number) => `€${(v / 1_000_000).toFixed(0)}M récord`,
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
  tolerance?: number;
  clues?: string[];
  options?: Array<{
    playerId: string;
    label: string;
    value?: number;
    statKey?: StatType;
  }>;
  // Kept server-side or encrypted for fairness
  correctValue?: number;
  correctPlayerId?: string;
  correctStatKey?: StatType;
  correctOrderIds?: string[];
}

export interface GameAnswerSubmission {
  questionId: string;
  roundNumber: number;
  selectedPlayerId?: string;
  selectedPlayerIds?: string[];
  orderedPlayerIds?: string[];
  selectedStatKey?: StatType;
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

export interface CustomGameConfig {
  gameType: GameType;
  stat: StatType;
  competition: string;
  season: string;
  playerCount: number;
  position: 'all' | 'POR' | 'DEF' | 'MED' | 'DEL' | 'formation-433';
  nationality: string;
  club: string;
  ageEra: 'all' | 'u21' | '21-25' | '26-30' | '30plus' | 'historical';
  objective: 'max' | 'min' | 'exact' | 'closest' | 'limit' | 'target';
  rounds: number;
  timeLimitSeconds: number;
  difficulty: Difficulty;
  randomness: 'fixed' | 'random' | 'seeded';
  seed?: string;
  scoringBonuses: {
    speedBonus: boolean;
    streakMultiplier: boolean;
    penaltyOnError: boolean;
  };
  playMode: 'solo' | 'friends' | '1v1' | 'private' | 'public';
  shareCode?: string;
}
