'use client';

import React, { use } from 'react';
import { useSearchParams } from 'next/navigation';
import PlayArenaPage from '@/app/play/[mode]/page';

export default function SharedGamePage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const gameType = searchParams.get('type') || 'higher';

  // Delegate directly to PlayArenaPage with the specified mode
  const modePromise = Promise.resolve({ mode: gameType });
  return <PlayArenaPage params={modePromise} />;
}
