import { NextResponse } from 'next/server';
import { statRepository } from '@/lib/db/repository';
import { getFootballDataProvider } from '@/lib/data-providers/factory';

export async function GET() {
  try {
    const logs = await statRepository.getSyncLogs();
    const states = await statRepository.getSyncState();
    const footballProvider = getFootballDataProvider();
    const quota = await footballProvider.getQuotaInfo();

    return NextResponse.json({
      success: true,
      provider: footballProvider.name,
      quota,
      latestLogs: logs.slice(0, 20),
      states,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching sync status';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
