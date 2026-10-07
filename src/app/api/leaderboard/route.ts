import { NextResponse } from 'next/server';
import { statRepository } from '@/lib/db/repository';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') || 'global') as 'global' | 'weekly' | 'daily';

    const profiles = await statRepository.getLeaderboard(type);

    const rankings = profiles.map((p, index) => ({
      rank: index + 1,
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      level: p.level,
      xp: p.xp,
      gamesWon: p.games_won,
      bestScore: p.best_score,
      dailyStreak: p.daily_streak,
    }));

    return NextResponse.json({
      success: true,
      rankings,
      type,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching leaderboard';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
