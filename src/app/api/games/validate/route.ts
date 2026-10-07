import { NextResponse } from 'next/server';
import { gameEngine } from '@/lib/game-engine/GameEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, submission, streakCount = 0 } = body;

    if (!sessionId || !submission) {
      return NextResponse.json({ success: false, error: 'Missing session or submission data.' }, { status: 400 });
    }

    const result = await gameEngine.validateAnswer(sessionId, submission, Number(streakCount));

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error validating answer';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
