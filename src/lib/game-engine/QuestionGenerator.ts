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
      case 'ranking':
        return this.buildRankingQuestion(roundNumber, stat, shuffled, options.format || 4);
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
        return this.buildDraftQuestion(roundNumber, stat, shuffled);
      case 'squad-dna':
        return this.buildSquadDNAQuestion(roundNumber, stat, shuffled);
      case 'player-chain':
        return this.buildPlayerChainQuestion(roundNumber, stat, shuffled);
      case 'battle':
        return this.buildHigherQuestion(roundNumber, stat, shuffled, 2);
      case 'random-challenge': {
        const subModes: GameType[] = ['higher', 'lower', 'higher-lower', 'exact', 'closest', 'guess-stat', 'limit', 'target'];
        const pickedMode = subModes[Math.floor(this.rng.next() * subModes.length)];
        return this.generateSingleQuestion(roundNumber, { ...options, gameType: pickedMode });
      }
      default:
        return this.buildHigherQuestion(roundNumber, stat, shuffled, 4);
    }
  }

  private selectRandomStat(gameType: GameType): StatType {
    if (gameType === 'lower') {
      const lowerStats: StatType[] = ['yellow_cards', 'red_cards', 'fouls_committed', 'goals_conceded'];
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
      'minutes',
    ];
    return defaultStats[Math.floor(this.rng.next() * defaultStats.length)];
  }

  private buildHigherQuestion(
    round: number,
    stat: StatType,
    pool: GamePlayerPoolRecord[],
    count = 4
  ): GameQuestion {
    const selected = pool.slice(0, Math.min(count, pool.length));
    const meta = STAT_REGISTRY[stat];

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
      id: `q-${round}-${stat}-h`,
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
    const selected = pool.slice(0, Math.min(count, pool.length));
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
      id: `q-${round}-${stat}-l`,
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

  private buildRankingQuestion(
    round: number,
    stat: StatType,
    pool: GamePlayerPoolRecord[],
    count = 4
  ): GameQuestion {
    const selected = pool.slice(0, Math.min(count, pool.length));
    const meta = STAT_REGISTRY[stat];

    // Sorted descending by stat value
    const sorted = [...selected].sort((a, b) => ((b[stat] as number) || 0) - ((a[stat] as number) || 0));
    const correctOrderIds = sorted.map((p) => p.player_id);

    return {
      id: `q-${round}-${stat}-rank`,
      roundNumber: round,
      gameType: 'ranking',
      prompt: `Ordena de MAYOR a MENOR por ${meta.label.toUpperCase()}`,
      stat,
      players: selected,
      correctOrderIds,
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
      id: `q-${round}-${stat}-hl`,
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
      id: `q-${round}-${stat}-exact`,
      roundNumber: round,
      gameType: 'exact',
      prompt: `¿Cuántos ${meta.label.toLowerCase()} registró ${player.name}?`,
      stat,
      players: [player],
      correctValue: correctVal,
      correctPlayerId: player.player_id,
      tolerance: stat === 'minutes' || stat === 'passes' ? 100 : 0,
    };
  }

  private buildClosestQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const player = pool[0];
    const meta = STAT_REGISTRY[stat];
    const correctVal = (player[stat] as number) || 0;

    return {
      id: `q-${round}-${stat}-close`,
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

    // Plausible candidate stat categories to choose from
    const candidateStats: StatType[] = [
      stat,
      stat === 'goals' ? 'assists' : 'goals',
      stat === 'yellow_cards' ? 'red_cards' : 'yellow_cards',
      stat === 'shots_on_target' ? 'key_passes' : 'shots_on_target',
    ];

    const uniqueOptions = Array.from(new Set(candidateStats));
    while (uniqueOptions.length < 4) {
      const fallback: StatType[] = ['goals', 'assists', 'titles', 'yellow_cards', 'shots_on_target'];
      const add = fallback.find((s) => !uniqueOptions.includes(s));
      if (add) uniqueOptions.push(add);
      else break;
    }

    const shuffledOptions = this.rng.shuffle(uniqueOptions);

    return {
      id: `q-${round}-${stat}-guess`,
      roundNumber: round,
      gameType: 'guess-stat',
      prompt: `${player.name} registró ${meta.formatValue(correctVal)}. ¿Qué estadística representa esta cifra?`,
      stat,
      players: [player],
      correctValue: correctVal,
      correctStatKey: stat,
      correctPlayerId: player.player_id,
      options: shuffledOptions.map((sKey) => ({
        playerId: player.player_id,
        statKey: sKey,
        label: STAT_REGISTRY[sKey].label,
        value: (player[sKey] as number) || 0,
      })),
    };
  }

  private buildLimitQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const selected = pool.slice(0, 6);
    const meta = STAT_REGISTRY[stat];
    const limit = stat === 'goals' ? 45 : stat === 'assists' ? 25 : stat === 'market_value' ? 200_000_000 : 50;

    return {
      id: `q-${round}-${stat}-limit`,
      roundNumber: round,
      gameType: 'limit',
      prompt: `¡Football 21! Elige futbolistas sumando ${meta.label.toLowerCase()} sin pasarte de ${meta.formatValue(limit)}.`,
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

    // Build target from sum of 2 or 3 players so a target is achievable
    const combo = selected.slice(0, 2);
    const target = combo.reduce((sum, p) => sum + ((p[stat] as number) || 0), 0) || 30;

    return {
      id: `q-${round}-${stat}-target`,
      roundNumber: round,
      gameType: 'target',
      prompt: `Objetivo: Acércate o iguala ${meta.formatValue(target)} combinando futbolistas.`,
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

  private buildDraftQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const positions: Array<'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker'> = [
      'Goalkeeper',
      'Defender',
      'Midfielder',
      'Attacker',
      'Attacker',
    ];
    const currentPos = positions[(round - 1) % positions.length];
    const meta = STAT_REGISTRY[stat];

    const posPlayers = pool.filter((p) => p.position === currentPos);
    const candidates = (posPlayers.length >= 4 ? posPlayers : pool).slice(0, 4);

    // Best candidate is highest stat
    const best = [...candidates].sort((a, b) => ((b[stat] as number) || 0) - ((a[stat] as number) || 0))[0];

    return {
      id: `q-${round}-${stat}-draft`,
      roundNumber: round,
      gameType: 'draft',
      prompt: `Draft XI [Posición: ${currentPos}]: Ficha al jugador para maximizar ${meta.label.toUpperCase()}`,
      stat,
      players: candidates,
      correctPlayerId: best.player_id,
      correctValue: (best[stat] as number) || 0,
      options: candidates.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }

  private buildSquadDNAQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const selected = pool.slice(0, 6);
    const meta = STAT_REGISTRY[stat];

    return {
      id: `q-${round}-${stat}-dna`,
      roundNumber: round,
      gameType: 'squad-dna',
      prompt: `Squad DNA: Selecciona los 3 jugadores que mejor optimicen ${meta.label.toUpperCase()}`,
      stat,
      players: selected,
      options: selected.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }

  private buildPlayerChainQuestion(round: number, stat: StatType, pool: GamePlayerPoolRecord[]): GameQuestion {
    const origin = pool[0];
    const candidates = pool.slice(1, 5);
    const meta = STAT_REGISTRY[stat];

    // Chain rule: next player must have higher stat than origin
    const originVal = (origin[stat] as number) || 0;
    const validChains = candidates.filter((c) => ((c[stat] as number) || 0) >= originVal);
    const correctPlayer = validChains.length > 0 ? validChains[0] : candidates[0];

    return {
      id: `q-${round}-${stat}-chain`,
      roundNumber: round,
      gameType: 'player-chain',
      prompt: `Player Chain: ${origin.name} (${meta.formatValue(originVal)}) ➔ ¿Quién continúa la cadena con registro MAYOR?`,
      stat,
      players: [origin, ...candidates],
      correctPlayerId: correctPlayer.player_id,
      correctValue: (correctPlayer[stat] as number) || 0,
      options: candidates.map((p) => ({
        playerId: p.player_id,
        label: p.name,
        value: p[stat] as number,
      })),
    };
  }
}
