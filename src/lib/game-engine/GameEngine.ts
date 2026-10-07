// =====================================================================
// GAME ENGINE ORCHESTRATOR
// Master engine managing sessions, questions, server validation & scoring
// =====================================================================

import { QuestionGenerator } from './QuestionGenerator';
import { ScoringEngine } from './ScoringEngine';
import {
  GameType,
  StatType,
  Difficulty,
  GameQuestion,
  GameAnswerSubmission,
  AnswerValidationResult,
  STAT_REGISTRY,
} from './types';
import { statRepository } from '../db/repository';
import { GameSessionRecord, DailyChallengeRecord } from '../db/types';

export interface StartSessionOptions {
  gameType: GameType;
  stat?: StatType;
  difficulty?: Difficulty;
  competitionId?: string;
  userId?: string;
  seed?: string;
  rounds?: number;
  format?: number;
}

export interface ActiveSession {
  sessionId: string;
  gameType: GameType;
  stat: StatType;
  difficulty: Difficulty;
  questions: GameQuestion[];
  currentRound: number;
  totalRounds: number;
  seed?: string;
  startedAt: string;
}

// In-memory active sessions store for server validation
const activeSessions = new Map<string, ActiveSession>();

export class GameEngine {
  async startSession(options: StartSessionOptions): Promise<ActiveSession> {
    const generator = new QuestionGenerator(options.seed);
    const questions = await generator.generateRounds({
      gameType: options.gameType,
      stat: options.stat,
      difficulty: options.difficulty,
      competitionId: options.competitionId,
      rounds: options.rounds || 5,
      format: options.format || 4,
      seed: options.seed,
    });

    if (questions.length === 0) {
      throw new Error('Could not generate sufficient questions for this mode. Please adjust criteria.');
    }

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const effectiveStat = options.stat || questions[0].stat;

    const session: ActiveSession = {
      sessionId,
      gameType: options.gameType,
      stat: effectiveStat,
      difficulty: options.difficulty || 'medium',
      questions,
      currentRound: 1,
      totalRounds: questions.length,
      seed: options.seed,
      startedAt: new Date().toISOString(),
    };

    activeSessions.set(sessionId, session);

    // Save initial session to repository
    const sessionRecord: GameSessionRecord = {
      id: sessionId,
      game_type: options.gameType,
      user_id: options.userId || null,
      stat: effectiveStat,
      format: options.format || 4,
      difficulty: options.difficulty || 'medium',
      seed: options.seed || null,
      started_at: session.startedAt,
      score: 0,
      xp_earned: 0,
      status: 'in_progress',
    };
    await statRepository.saveGameSession(sessionRecord);

    return session;
  }

  /**
   * Server-side answer validation
   */
  async validateAnswer(
    sessionId: string,
    submission: GameAnswerSubmission,
    streakCount = 0
  ): Promise<AnswerValidationResult> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Game session not found or expired.');
    }

    const question = session.questions.find((q) => q.id === submission.questionId);
    if (!question) {
      throw new Error('Question not found in this session.');
    }

    const meta = STAT_REGISTRY[question.stat];
    let isCorrect = false;
    let accuracyRatio = 0.0;
    let correctAnswerText = '';
    let userAnswerText = '';
    let difference = 0;

    switch (question.gameType) {
      case 'higher':
      case 'lower': {
        const correctId = question.correctPlayerId;
        isCorrect = submission.selectedPlayerId === correctId;
        const correctP = question.players.find((p) => p.player_id === correctId);
        const userP = question.players.find((p) => p.player_id === submission.selectedPlayerId);

        correctAnswerText = correctP
          ? `${correctP.name} (${meta.formatValue(question.correctValue || 0)})`
          : 'Jugador correcto';
        userAnswerText = userP
          ? `${userP.name} (${meta.formatValue((userP[question.stat] as number) || 0)})`
          : 'Opción seleccionada';
        accuracyRatio = isCorrect ? 1.0 : 0.0;
        break;
      }

      case 'higher-lower': {
        const pA = question.players[0];
        const pB = question.players[1];
        const valA = (pA[question.stat] as number) || 0;
        const valB = (pB[question.stat] as number) || 0;

        const isActuallyHigher = valB >= valA;
        isCorrect = (submission.choice === 'higher' && isActuallyHigher) || (submission.choice === 'lower' && !isActuallyHigher);

        correctAnswerText = `${pB.name} tiene ${meta.formatValue(valB)} (${isActuallyHigher ? 'MAYOR' : 'MENOR'} que ${pA.name}: ${meta.formatValue(valA)})`;
        userAnswerText = submission.choice === 'higher' ? 'MAYOR' : 'MENOR';
        accuracyRatio = isCorrect ? 1.0 : 0.0;
        break;
      }

      case 'exact':
      case 'closest': {
        const correctVal = question.correctValue || 0;
        const userVal = Number(submission.numericAnswer) || 0;
        difference = Math.abs(correctVal - userVal);

        if (question.gameType === 'exact') {
          isCorrect = difference === 0;
          accuracyRatio = isCorrect ? 1.0 : Math.max(0, 1 - difference / Math.max(1, correctVal * 0.4));
        } else {
          // Closest
          isCorrect = difference <= Math.max(1, Math.round(correctVal * 0.15));
          accuracyRatio = Math.max(0, 1 - difference / Math.max(1, correctVal * 0.5));
        }

        correctAnswerText = meta.formatValue(correctVal);
        userAnswerText = meta.formatValue(userVal);
        break;
      }

      case 'guess-stat': {
        const correctVal = question.correctValue || 0;
        const userVal = Number(submission.numericAnswer);
        isCorrect = userVal === correctVal;
        correctAnswerText = meta.formatValue(correctVal);
        userAnswerText = meta.formatValue(userVal || 0);
        accuracyRatio = isCorrect ? 1.0 : 0.0;
        break;
      }

      case 'limit': {
        const limit = question.limitValue || 50;
        const selectedIds = submission.selectedPlayerIds || [];
        const chosenPlayers = question.players.filter((p) => selectedIds.includes(p.player_id));
        const sum = chosenPlayers.reduce((acc, p) => acc + ((p[question.stat] as number) || 0), 0);

        if (sum > limit) {
          isCorrect = false;
          accuracyRatio = 0;
          userAnswerText = `Te pasaste: ${sum} (Límite: ${limit})`;
        } else {
          isCorrect = true;
          accuracyRatio = sum / limit;
          userAnswerText = `Total: ${sum} / ${limit}`;
        }
        correctAnswerText = `Límite: ${limit}`;
        break;
      }

      default: {
        isCorrect = true;
        accuracyRatio = 1.0;
        correctAnswerText = 'Válido';
        userAnswerText = 'Completado';
      }
    }

    const scoreResult = ScoringEngine.calculate({
      difficulty: session.difficulty,
      timeLimitSeconds: 20,
      responseTimeMs: submission.responseTimeMs,
      accuracyRatio,
      streakCount,
      isCorrect,
    });

    return {
      questionId: question.id,
      isCorrect,
      scoreAwarded: scoreResult.finalScore,
      accuracyPercentage: Math.round(accuracyRatio * 100),
      correctAnswerText,
      userAnswerText,
      difference,
    };
  }

  async getDailyChallengeForDate(dateStr: string): Promise<DailyChallengeRecord> {
    let existing = await statRepository.getDailyChallenge(dateStr);
    if (!existing) {
      // Deterministically generate Daily Challenge
      const seed = `statxi-daily-${dateStr}`;
      const rng = new QuestionGenerator(seed);
      const statsPool: StatType[] = ['goals', 'assists', 'market_value', 'titles', 'key_passes'];
      const modesPool: GameType[] = ['higher', 'closest', 'higher-lower', 'guess-stat', 'limit'];

      // Pick index based on date string hash
      const dateHash = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const chosenStat = statsPool[dateHash % statsPool.length];
      const chosenMode = modesPool[dateHash % modesPool.length];

      existing = {
        id: `dc-${dateStr}`,
        date: dateStr,
        title: `Reto Diario: ${STAT_REGISTRY[chosenStat].label}`,
        description: `Demuestra tu dominio futbolístico en el reto oficial del día. 1 intento válido para la clasificación mundial.`,
        game_type: chosenMode,
        stat: chosenStat,
        difficulty: 'medium',
        format: 4,
        seed,
        config: { rounds: 5, timeLimit: 20 },
        created_at: new Date().toISOString(),
      };

      await statRepository.saveDailyChallenge(existing);
    }

    return existing;
  }
}

export const gameEngine = new GameEngine();
