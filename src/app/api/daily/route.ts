import { NextResponse } from 'next/server';
import { gameEngine } from '@/lib/game-engine/GameEngine';
import { statRepository } from '@/lib/db/repository';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const challenge = await gameEngine.getDailyChallengeForDate(dateParam);
    const attempts = await statRepository.getDailyAttempts(challenge.id);

    return NextResponse.json({
      success: true,
      challenge,
      leaderboard: attempts.slice(0, 50),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching daily challenge';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { challengeId, userId, username, avatar, score, timeTakenSeconds } = body;

    if (!challengeId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing challenge or user ID.' }, { status: 400 });
    }

    await statRepository.recordDailyAttempt({
      id: `att-${Date.now()}`,
      challenge_id: challengeId,
      user_id: userId,
      username: username || 'Crack_Anonymous',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      score: Number(score) || 0,
      time_taken_seconds: Number(timeTakenSeconds) || 30,
      completed_at: new Date().toISOString(),
    });

    // Also award DAILY_MASTER achievement
    await statRepository.unlockAchievement(userId, 'DAILY_MASTER');

    const updatedAttempts = await statRepository.getDailyAttempts(challengeId);

    return NextResponse.json({
      success: true,
      leaderboard: updatedAttempts.slice(0, 50),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error recording attempt';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
