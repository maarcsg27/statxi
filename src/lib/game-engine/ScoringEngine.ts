// =====================================================================
// SCORING ENGINE
// Central mathematical calculation for points, XP, streaks and accuracy
// =====================================================================

import { Difficulty } from './types';

export interface ScoreCalculationParams {
  basePoints?: number;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  responseTimeMs: number;
  accuracyRatio?: number; // 0.0 to 1.0 (for closest / exact modes)
  streakCount?: number;
  isCorrect?: boolean;
}

export interface ScoreBreakdown {
  finalScore: number;
  xpEarned: number;
  basePoints: number;
  difficultyMultiplier: number;
  timeMultiplier: number;
  accuracyMultiplier: number;
  streakMultiplier: number;
}

export class ScoringEngine {
  private static readonly DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
    easy: 1.0,
    medium: 1.35,
    hard: 1.75,
    expert: 2.25,
  };

  /**
   * Calculates server-validated score and XP
   */
  static calculate(params: ScoreCalculationParams): ScoreBreakdown {
    const {
      basePoints = 100,
      difficulty = 'medium',
      timeLimitSeconds = 20,
      responseTimeMs = 5000,
      accuracyRatio = 1.0,
      streakCount = 0,
      isCorrect = true,
    } = params;

    if (!isCorrect && accuracyRatio <= 0.05) {
      return {
        finalScore: 0,
        xpEarned: 10, // Small participation XP
        basePoints,
        difficultyMultiplier: this.DIFFICULTY_MULTIPLIERS[difficulty],
        timeMultiplier: 1.0,
        accuracyMultiplier: 0,
        streakMultiplier: 1.0,
      };
    }

    const diffMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty] || 1.35;

    // Time multiplier: answering in less than 25% time gives up to 1.5x bonus
    const maxTimeMs = timeLimitSeconds * 1000;
    const clampedResponse = Math.max(500, Math.min(responseTimeMs, maxTimeMs));
    const timeRemainingFraction = Math.max(0, (maxTimeMs - clampedResponse) / maxTimeMs);
    const timeMultiplier = Number((1.0 + timeRemainingFraction * 0.5).toFixed(2));

    // Accuracy multiplier (e.g. For closest/exact distance)
    const accuracyMultiplier = Number(Math.max(0, Math.min(accuracyRatio, 1.0)).toFixed(2));

    // Streak multiplier following prompt specification:
    // 1 -> x1.0, 2 -> x1.2, 3 -> x1.5, 4 -> x2.0, 5+ -> x3.0
    let streakMultiplier = 1.0;
    if (streakCount >= 5) streakMultiplier = 3.0;
    else if (streakCount === 4) streakMultiplier = 2.0;
    else if (streakCount === 3) streakMultiplier = 1.5;
    else if (streakCount === 2) streakMultiplier = 1.2;
    else streakMultiplier = 1.0;

    // Final points computation
    const rawScore = basePoints * diffMultiplier * timeMultiplier * accuracyMultiplier * streakMultiplier;
    const finalScore = Math.max(0, Math.round(rawScore));

    // XP calculation: 10% of score + completion bonus
    const xpEarned = Math.max(15, Math.round(finalScore * 0.12));

    return {
      finalScore,
      xpEarned,
      basePoints,
      difficultyMultiplier: diffMultiplier,
      timeMultiplier,
      accuracyMultiplier,
      streakMultiplier,
    };
  }
}
