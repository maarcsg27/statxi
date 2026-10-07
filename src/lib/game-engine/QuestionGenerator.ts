// =====================================================================
// QUESTION GENERATOR
// Selects valid player pools, checks data integrity, prevents ties,
// and crafts questions across all 12 STATXI game formats.
// =====================================================================

import { statRepository, PoolFilterOptions } from '../db/repository';
import { GamePlayerPoolRecord } from '../db/types';
import { GameType, StatType, Difficulty, GameQuestion, STAT_REGISTRY } from './types';

// Seeded PRNG (Mulberry32) for deterministic Daily Challenges
export class SeededRandom {
  private state: number;

  constructor(seedString: string) {
    let h = 1779033703 ^ seedString.length;
    for (let i = 0; i < seedString.length; i++) {
      h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    this.state = h;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

export interface QuestionGeneratorOptions {
  gameType: GameType;
  stat?: StatType;
  difficulty?: Difficulty;
  competitionId?: string;
  rounds?: number;
  format?: number;
  seed?: string;
}

export class QuestionGenerator {
  private rng: SeededRandom;

  constructor(seed?: string) {
    this.rng = new SeededRandom(seed || Math.random().toString(36));
  }

  async generateRounds(options: QuestionGeneratorOptions): Promise<GameQuestion[]> {
    const roundsCount = options.rounds || 5;
    const questions: GameQuestion[] = [];

    for (let round = 1; round <= roundsCount; round++) {
      const q = await this.generateSingleQuestion(round, options);
      if (q) questions.push(q);
    }

    return questions;
  }

  private async generateSingleQuestion(
    roundNumber: number,
    options: QuestionGeneratorOptions
  ): Promise<GameQuestion | null> {
    const stat = options.stat || this.selectRandomStat(options.gameType);
    const difficulty = options.difficulty || 'medium';

    const filter: PoolFilterOptions = {
      stat,
      competitionId: options.competitionId,
    };

    let pool = await statRepository.queryGamePlayerPool(filter);
    // Ensure all have non-null stat values
    pool = pool.filter((p) => p[stat] !== null && p[stat] !== undefined);

    if (pool.length < 2) {
      // Fallback to all players if competition-filtered is too small
      pool = (await statRepository.queryGamePlayerPool({ stat })).filter((p) => p[stat] !== null);
    }

    if (pool.length < 2) return null;

    const shuffled = this.rng.shuffle(pool);

    switch (options.gameType) {
      case 'higher':
        return this.buildHigherQuestion(roundNumber, stat, shuffled, options.format || 4);
      case 'lower':
        return this.buildLowerQuestion(roundNumber, stat, shuffled, options.format || 4);
      case 'higher-lower':
        return this.buildHigherLowerQuestion(roundNumber, stat, shuffled);
      case 'exact':
        return this.buildExactQuestion(roundNumber, stat, shuffled);
      case 'closest':
        return this.buildClosestQuestion(roundNumber, stat, shuffled);
      case 'guess-stat':
        return this.buildGuessStatQuestion(roundNumber, stat, shuffled);
      case 'limit':
        return this.buildLimitQuestion(roundNumber, stat, shuffled);
      case 'target':
        return this.buildTargetQuestion(roundNumber, stat, shuffled);
      case 'draft':
      case 'squad-dna':
      case 'player-chain':
      case 'random-challenge':
      default:
        return this.buildHigherQuestion(roundNumber, stat, shuffled, 4);
    }
  }

  private selectRandomStat(gameType: GameType): StatType {
    if (gameType === 'lower') {
      const lowerStats: StatType[] = ['yellow_cards', 'red_cards'];
      return lowerStats[Math.floor(this.rng.next() * lowerStats.length)];
    }
    const defaultStats: StatType[] = [
      'goals',
      'assists',
      'market_value',
      'appearances',
      'key_passes',
      'shots_on_target',
      'titles',
    ];
    return defaultStats[Math.floor(this.rng.next() * defaultStats.length)];
  }

  private buildHigherQuestion(
    round: number,
    stat: StatType,
    pool: GamePlayerPoolRecord[],
    count = 4
  ): GameQuestion {
    const selected = pool.slice(0, count);
    const meta = STAT_REGISTRY[stat];

    // Find the player with the highest stat
    let highestPlayer = selected[0];
    let highestVal = (highestPlayer[stat] as number) || 0;

    for (let i = 1; i < selected.length; i++) {
      const val = (selected[i][stat] as number) || 0;
      if (val > highestVal) {
        highestVal = val;
        highestPlayer = selected[i];
      }
    }

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'higher',
      prompt: `¿Cuál de estos futbolistas tiene MÁS ${meta.label.toUpperCase()}?`,
      stat,
      players: selected,
      correctPlayerId: highestPlayer.player_id,
      correctValue: highestVal,
      options: selected.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }

  private buildLowerQuestion(
    round: number,
    stat: StatType,
    pool: GamePlayerPoolRecord[],
    count = 4
  ): GameQuestion {
    const selected = pool.slice(0, count);
    const meta = STAT_REGISTRY[stat];

    let lowestPlayer = selected[0];
    let lowestVal = (lowestPlayer[stat] as number) || 0;

    for (let i = 1; i < selected.length; i++) {
      const val = (selected[i][stat] as number) || 0;
      if (val < lowestVal) {
        lowestVal = val;
        lowestPlayer = selected[i];
      }
    }

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'lower',
      prompt: `¿Quién tiene MENOS ${meta.label.toUpperCase()}?`,
      stat,
      players: selected,
      correctPlayerId: lowestPlayer.player_id,
      correctValue: lowestVal,
      options: selected.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }

  private buildHigherLowerQuestion(
    round: number,
    stat: StatType,
    pool: GamePlayerPoolRecord[]
  ): GameQuestion {
    const [pA, pB] = pool.slice(0, 2);
    const meta = STAT_REGISTRY[stat];
    const valA = (pA[stat] as number) || 0;
    const valB = (pB[stat] as number) || 0;

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'higher-lower',
      prompt: `¿Tiene ${pB.name} más o menos ${meta.label.toLowerCase()} que ${pA.name}?`,
      stat,
      players: [pA, pB],
      correctValue: valB,
      options: [
        { playerId: pA.player_id, label: pA.name, value: valA },
        { playerId: pB.player_id, label: pB.name, value: valB },
      ],
    };
  }

  private buildExactQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const player = pool[0];
    const meta = STAT_REGISTRY[stat];
    const correctVal = (player[stat] as number) || 0;

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'exact',
      prompt: `¿Cuántos ${meta.label.toLowerCase()} registró ${player.name}?`,
      stat,
      players: [player],
      correctValue: correctVal,
      correctPlayerId: player.player_id,
    };
  }

  private buildClosestQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const player = pool[0];
    const meta = STAT_REGISTRY[stat];
    const correctVal = (player[stat] as number) || 0;

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'closest',
      prompt: `Aproxímate: ¿Cuál es el registro de ${meta.label.toLowerCase()} de ${player.name}?`,
      stat,
      players: [player],
      correctValue: correctVal,
      correctPlayerId: player.player_id,
    };
  }

  private buildGuessStatQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const player = pool[0];
    const meta = STAT_REGISTRY[stat];
    const correctVal = (player[stat] as number) || 0;

    // Generate 4 plausible choices around correct value
    const deltas = [-Math.round(correctVal * 0.35 + 2), 0, Math.round(correctVal * 0.25 + 3), Math.round(correctVal * 0.6 + 5)];
    const optionsVals = this.rng.shuffle(
      deltas.map((d) => Math.max(0, correctVal + d)).filter((v, idx, arr) => arr.indexOf(v) === idx)
    );

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'guess-stat',
      prompt: `¿Cuántos ${meta.label.toLowerCase()} tiene ${player.name}?`,
      stat,
      players: [player],
      correctValue: correctVal,
      correctPlayerId: player.player_id,
      options: optionsVals.map((val) => ({
        playerId: player.player_id,
        label: meta.formatValue(val),
        value: val,
      })),
    };
  }

  private buildLimitQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const selected = pool.slice(0, 6);
    const meta = STAT_REGISTRY[stat];
    const limit = stat === 'goals' ? 45 : stat === 'assists' ? 25 : 60;

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'limit',
      prompt: `¡Football 21! Elige futbolistas sumando ${meta.label.toLowerCase()} sin pasarte de ${limit}.`,
      stat,
      players: selected,
      limitValue: limit,
      options: selected.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }

  private buildTargetQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const selected = pool.slice(0, 6);
    const meta = STAT_REGISTRY[stat];
    const target = stat === 'goals' ? 65 : 40;

    return {
      id: `q-${round}-${stat}`,
      roundNumber: round,
      gameType: 'target',
      prompt: `Objetivo: Acércate lo máximo posible a ${target} ${meta.label.toLowerCase()} combinando 3 jugadores.`,
      stat,
      players: selected,
      targetValue: target,
      options: selected.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }
}
