import { NextResponse } from 'next/server';
import { statRepository } from '@/lib/db/repository';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, totalScore = 0, isWin = true, roundsWon = 0, totalRounds = 5 } = body;

    const effectiveUserId = userId || 'guest-user';
    const xpEarned = Math.max(25, Math.round(Number(totalScore) * 0.12));

    const updatedProfile = await statRepository.updateProfileProgress(
      effectiveUserId,
      Number(totalScore),
      xpEarned,
      Boolean(isWin)
    );

    // Check & unlock achievements
    const newlyUnlocked: string[] = [];

    // First match achievement
    if (updatedProfile.games_played >= 1) {
      const unlocked = await statRepository.unlockAchievement(effectiveUserId, 'FIRST_MATCH');
      if (unlocked) newlyUnlocked.push('FIRST_MATCH');
    }

    // Sniper accuracy
    if (roundsWon === totalRounds && totalRounds >= 5) {
      const unlocked = await statRepository.unlockAchievement(effectiveUserId, 'SNIPER_ACCURACY');
      if (unlocked) newlyUnlocked.push('SNIPER_ACCURACY');
    }

    // Stat geek (high score)
    if (totalScore >= 5000) {
      const unlocked = await statRepository.unlockAchievement(effectiveUserId, 'STAT_GEEK');
      if (unlocked) newlyUnlocked.push('STAT_GEEK');
    }

    // 7 day streak
    if (updatedProfile.daily_streak >= 7) {
      const unlocked = await statRepository.unlockAchievement(effectiveUserId, 'STREAK_7');
      if (unlocked) newlyUnlocked.push('STREAK_7');
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      xpEarned,
      newlyUnlocked,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error completing match';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
