import { NextResponse } from 'next/server';
import { statRepository } from '@/lib/db/repository';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let profile = null;
    if (userId) {
      profile = await statRepository.getProfile(userId);
    }

    if (!profile) {
      profile = await statRepository.getOrCreateGuestProfile(userId || undefined);
    }

    const allAchievements = await statRepository.getAchievements();
    const userUnlockedIds = await statRepository.getUserAchievements(profile.id);

    const achievementsWithStatus = allAchievements.map((ach) => ({
      ...ach,
      unlocked: userUnlockedIds.includes(ach.id),
    }));

    return NextResponse.json({
      success: true,
      profile,
      achievements: achievementsWithStatus,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching profile';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
