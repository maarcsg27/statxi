import { NextResponse } from 'next/server';
import { gameEngine } from '@/lib/game-engine/GameEngine';
import { GameType, StatType, Difficulty } from '@/lib/game-engine/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      gameType = 'higher',
      stat,
      difficulty = 'medium',
      competitionId,
      userId,
      seed,
      rounds = 5,
      format = 4,
    } = body;

    const session = await gameEngine.startSession({
      gameType: gameType as GameType,
      stat: stat as StatType,
      difficulty: difficulty as Difficulty,
      competitionId,
      userId,
      seed,
      rounds: Number(rounds),
      format: Number(format),
    });

    // Sanitized questions for client (correct answers and values are protected)
    const clientQuestions = session.questions.map((q) => ({
      id: q.id,
      roundNumber: q.roundNumber,
      gameType: q.gameType,
      prompt: q.prompt,
      stat: q.stat,
      players: q.players.map((p) => ({
        player_id: p.player_id,
        name: p.name,
        photo: p.photo,
        position: p.position,
        nationality: p.nationality,
        club_name: p.club_name,
        club_logo: p.club_logo,
      })),
      limitValue: q.limitValue,
      targetValue: q.targetValue,
      tolerance: q.tolerance,
      options: q.options?.map((opt) => ({
        playerId: opt.playerId,
        label: opt.label,
        statKey: opt.statKey,
        // For higher-lower, reveal player A value
        value: q.gameType === 'higher-lower' && opt.playerId === q.players[0].player_id ? opt.value : undefined,
      })),
    }));

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      gameType: session.gameType,
      stat: session.stat,
      difficulty: session.difficulty,
      totalRounds: session.totalRounds,
      questions: clientQuestions,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error generating game';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
