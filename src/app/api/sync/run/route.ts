import { NextResponse } from 'next/server';
import { dataSyncEngine } from '@/lib/sync/sync-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mode = 'manual', entity = 'all', forceFull = false } = body;

    const result = await dataSyncEngine.runSync({
      mode,
      entity,
      forceFull,
    });

    return NextResponse.json({
      success: result.status !== 'FAILED',
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error executing sync job';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
