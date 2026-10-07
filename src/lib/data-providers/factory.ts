// =====================================================================
// DATA PROVIDERS FACTORY
// Switches between Live API-Football and Mock without touching GameEngine
// =====================================================================

import { FootballDataProvider, MarketValueProvider } from './types';
import { ApiFootballProvider } from './api-football/api-football-provider';
import { MockFootballProvider } from './mock/mock-football-provider';
import { HighlightlyMarketValueProvider } from './market-value/highlightly-provider';

export function getFootballDataProvider(): FootballDataProvider {
  const provider = (process.env.DATA_PROVIDER || 'mock').toLowerCase();

  if (provider === 'api' || provider === 'api_football' || provider === 'api-football') {
    if (!process.env.API_FOOTBALL_KEY) {
      console.warn('[DataProviders] DATA_PROVIDER=api requested but API_FOOTBALL_KEY is missing. Falling back to Mock.');
      return new MockFootballProvider();
    }
    return new ApiFootballProvider();
  }

  return new MockFootballProvider();
}

export function getMarketValueProvider(): MarketValueProvider {
  return new HighlightlyMarketValueProvider();
}
