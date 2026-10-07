// =====================================================================
// API-FOOTBALL PROVIDER IMPLEMENTATION (v3 API-SPORTS)
// Never exposed to client-side. Uses retries and rate limit awareness.
// =====================================================================

import {
  FootballDataProvider,
  ExternalCompetition,
  ExternalSeason,
  ExternalClub,
  ExternalPlayer,
  ExternalSeasonStats,
  ExternalFixture,
  ExternalFixturePlayerStats,
  ExternalTransfer,
  ExternalTrophy,
  QuotaInfo,
} from '../types';

export class ApiFootballProvider implements FootballDataProvider {
  readonly name = 'api_football';
  private readonly baseUrl = 'https://v3.football.api-sports.io';
  private readonly apiKey: string;
  private remainingQuota = 100;
  private dailyLimit = 100;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.API_FOOTBALL_KEY || '';
  }

  private async fetchWithRetry<T>(endpoint: string, params: Record<string, string | number> = {}, retries = 3): Promise<T> {
    if (!this.apiKey) {
      throw new Error('[ApiFootballProvider] API_FOOTBALL_KEY is not configured.');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.append(key, String(val));
    });

    let lastError: Error | null = null;
    let delay = 1000;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'x-apisports-key': this.apiKey,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        const remaining = response.headers.get('x-ratelimit-requests-remaining');
        if (remaining !== null) {
          this.remainingQuota = parseInt(remaining, 10);
        }

        if (response.status === 429) {
          throw new Error('API-Football rate limit exceeded (429)');
        }

        if (!response.ok) {
          throw new Error(`API-Football error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.errors && Object.keys(data.errors).length > 0) {
          const errString = JSON.stringify(data.errors);
          if (errString !== '{}' && errString !== '[]') {
            throw new Error(`API-Football API error payload: ${errString}`);
          }
        }

        return data;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    throw lastError || new Error(`Failed request to ${endpoint}`);
  }

  async getCompetitions(): Promise<ExternalCompetition[]> {
    interface LeagueItem {
      league: { id: number; name: string; type: string; logo: string };
      country: { name: string };
    }
    const res = await this.fetchWithRetry<{ response: LeagueItem[] }>('/leagues', { current: 'true' });
    return (res.response || []).map((item) => ({
      id: item.league.id,
      name: item.league.name,
      country: item.country.name,
      type: item.league.type === 'League' ? 'league' : item.league.type === 'Cup' ? 'cup' : 'international',
      logo: item.league.logo,
    }));
  }

  async getSeasons(): Promise<ExternalSeason[]> {
    const res = await this.fetchWithRetry<{ response: number[] }>('/leagues/seasons');
    return (res.response || []).map((year) => ({
      year: `${year}`,
      isCurrent: year === new Date().getFullYear(),
    }));
  }

  async getTeams(competitionId: number, seasonYear: string): Promise<ExternalClub[]> {
    const seasonNumber = parseInt(seasonYear.split('/')[0], 10);
    interface TeamItem {
      team: { id: number; name: string; country: string; logo: string; founded: number };
      venue?: { name: string };
    }
    const res = await this.fetchWithRetry<{ response: TeamItem[] }>('/teams', {
      league: competitionId,
      season: seasonNumber,
    });
    return (res.response || []).map((item) => ({
      id: item.team.id,
      name: item.team.name,
      country: item.team.country,
      logo: item.team.logo,
      founded: item.team.founded,
      stadium: item.venue?.name,
    }));
  }

  async getPlayers(clubId: number, seasonYear: string): Promise<ExternalPlayer[]> {
    const seasonNumber = parseInt(seasonYear.split('/')[0], 10);
    interface PlayerItem {
      player: {
        id: number;
        name: string;
        firstname?: string;
        lastname?: string;
        age: number;
        nationality: string;
        height?: string;
        weight?: string;
        photo?: string;
      };
      statistics: Array<{
        games: { position: string };
      }>;
    }
    const res = await this.fetchWithRetry<{ response: PlayerItem[] }>('/players', {
      team: clubId,
      season: seasonNumber,
    });

    return (res.response || []).map((item) => {
      let position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker' = 'Midfielder';
      const rawPos = item.statistics?.[0]?.games?.position?.toLowerCase() || '';
      if (rawPos.includes('goalkeeper')) position = 'Goalkeeper';
      else if (rawPos.includes('defender')) position = 'Defender';
      else if (rawPos.includes('attacker') || rawPos.includes('forward')) position = 'Attacker';

      return {
        id: item.player.id,
        name: item.player.name,
        firstName: item.player.firstname,
        lastName: item.player.lastname,
        age: item.player.age || 25,
        nationality: item.player.nationality || 'Unknown',
        height: item.player.height,
        weight: item.player.weight,
        position,
        photo: item.player.photo,
        currentClubId: clubId,
      };
    });
  }

  async getFixtures(competitionId: number, seasonYear: string, fromDate?: string, toDate?: string): Promise<ExternalFixture[]> {
    const seasonNumber = parseInt(seasonYear.split('/')[0], 10);
    const params: Record<string, string | number> = {
      league: competitionId,
      season: seasonNumber,
    };
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;

    interface FixtureItem {
      fixture: { id: number; date: string; status: { short: string }; venue?: { name: string } };
      league: { round?: string };
      teams: { home: { id: number }; away: { id: number } };
      goals: { home: number | null; away: number | null };
    }
    const res = await this.fetchWithRetry<{ response: FixtureItem[] }>('/fixtures', params);

    return (res.response || []).map((item) => ({
      id: item.fixture.id,
      competitionId,
      seasonYear,
      homeTeamId: item.teams.home.id,
      awayTeamId: item.teams.away.id,
      date: item.fixture.date,
      status: item.fixture.status.short,
      homeScore: item.goals.home,
      awayScore: item.goals.away,
      round: item.league.round,
      venue: item.fixture.venue?.name,
    }));
  }

  async getFixturePlayerStats(fixtureId: number): Promise<ExternalFixturePlayerStats[]> {
    interface FixturePlayerItem {
      team: { id: number };
      players: Array<{
        player: { id: number; name: string };
        statistics: Array<{
          games: { minutes: number | null; rating: string | null; position: string };
          goals: { total: number | null; assists: number | null };
          shots: { total: number | null; on: number | null };
          passes: { total: number | null; key: number | null; accuracy: string | null };
          tackles: { total: number | null; blocks: number | null; interceptions: number | null };
          dribbles: { success: number | null };
          cards: { yellow: number | null; red: number | null };
        }>;
      }>;
    }

    const res = await this.fetchWithRetry<{ response: FixturePlayerItem[] }>('/fixtures/players', { fixture: fixtureId });
    const results: ExternalFixturePlayerStats[] = [];

    (res.response || []).forEach((teamItem) => {
      teamItem.players.forEach((p) => {
        const stats = p.statistics?.[0];
        if (!stats) return;

        results.push({
          playerId: p.player.id,
          fixtureId,
          minutes: stats.games.minutes,
          position: stats.games.position,
          rating: stats.games.rating ? parseFloat(stats.games.rating) : null,
          goals: stats.goals.total || 0,
          assists: stats.goals.assists || 0,
          shots: stats.shots.total,
          shotsOnTarget: stats.shots.on,
          passes: stats.passes.total,
          keyPasses: stats.passes.key,
          passAccuracy: stats.passes.accuracy ? parseFloat(stats.passes.accuracy) : null,
          dribbles: stats.dribbles.success,
          tackles: stats.tackles.total,
          interceptions: stats.tackles.interceptions,
          yellowCards: stats.cards.yellow || 0,
          redCards: stats.cards.red || 0,
        });
      });
    });

    return results;
  }

  async getPlayerSeasonStats(playerId: number, seasonYear: string): Promise<ExternalSeasonStats[]> {
    const seasonNumber = parseInt(seasonYear.split('/')[0], 10);
    interface StatItem {
      league: { id: number };
      statistics: Array<{
        league: { id: number };
        games: { appearances: number | null; lineups: number | null; minutes: number | null; rating: string | null };
        goals: { total: number | null; assists: number | null };
        shots: { total: number | null; on: number | null };
        passes: { total: number | null; key: number | null; accuracy: string | null };
        tackles: { total: number | null; blocks: number | null; interceptions: number | null };
        duels: { total: number | null; won: number | null };
        dribbles: { attempts: number | null; success: number | null };
        fouls: { committed: number | null; drawn: number | null };
        cards: { yellow: number | null; red: number | null };
        penalty: { scored: number | null; missed: number | null; total: number | null };
      }>;
    }

    const res = await this.fetchWithRetry<{ response: StatItem[] }>('/players', {
      id: playerId,
      season: seasonNumber,
    });

    const results: ExternalSeasonStats[] = [];

    (res.response || []).forEach((item) => {
      (item.statistics || []).forEach((stat) => {
        results.push({
          playerId,
          competitionId: stat.league.id,
          seasonYear,
          appearances: stat.games.appearances,
          starts: stat.games.lineups,
          minutes: stat.games.minutes,
          goals: stat.goals.total,
          assists: stat.goals.assists,
          penaltyGoals: stat.penalty.scored,
          penaltyAttempts: stat.penalty.total,
          penaltyMissed: stat.penalty.missed,
          shots: stat.shots.total,
          shotsOnTarget: stat.shots.on,
          passes: stat.passes.total,
          keyPasses: stat.passes.key,
          passAccuracy: stat.passes.accuracy ? parseFloat(stat.passes.accuracy) : null,
          dribbles: stat.dribbles.success,
          tackles: stat.tackles.total,
          interceptions: stat.tackles.interceptions,
          duels: stat.duels.total,
          duelsWon: stat.duels.won,
          foulsCommitted: stat.fouls.committed,
          foulsDrawn: stat.fouls.drawn,
          offsides: null,
          yellowCards: stat.cards.yellow,
          redCards: stat.cards.red,
          cleanSheets: null,
          saves: null,
          goalsConceded: null,
          rating: stat.games.rating ? parseFloat(stat.games.rating) : null,
        });
      });
    });

    return results;
  }

  async getTransfers(playerId: number): Promise<ExternalTransfer[]> {
    interface TransferItem {
      transfers: Array<{
        date: string;
        type: string;
        teams: { in: { id: number }; out: { id: number } };
      }>;
    }
    const res = await this.fetchWithRetry<{ response: TransferItem[] }>('/transfers', { player: playerId });
    const results: ExternalTransfer[] = [];

    (res.response || []).forEach((item) => {
      (item.transfers || []).forEach((t) => {
        results.push({
          playerId,
          fromClubId: t.teams.out?.id || null,
          toClubId: t.teams.in?.id || null,
          date: t.date,
          type: t.type,
        });
      });
    });

    return results;
  }

  async getTrophies(playerId: number): Promise<ExternalTrophy[]> {
    interface TrophyItem {
      league: string;
      country: string;
      season: string;
      place: string;
    }
    const res = await this.fetchWithRetry<{ response: TrophyItem[] }>('/trophies', { player: playerId });
    return (res.response || []).map((t) => ({
      playerId,
      competition: t.league,
      country: t.country,
      season: t.season,
      place: t.place.toLowerCase().includes('winner') ? 'Winner' : 'Runner-up',
    }));
  }

  async getQuotaInfo(): Promise<QuotaInfo> {
    try {
      const res = await this.fetchWithRetry<{
        response: {
          requests: { current: number; limit_day: number };
        };
      }>('/status');
      const req = res.response?.requests;
      if (req) {
        this.remainingQuota = req.limit_day - req.current;
        this.dailyLimit = req.limit_day;
        return {
          requestsToday: req.current,
          dailyLimit: req.limit_day,
          requestsRemaining: this.remainingQuota,
        };
      }
    } catch {
      // Fallback to internal counter
    }

    return {
      requestsToday: this.dailyLimit - this.remainingQuota,
      dailyLimit: this.dailyLimit,
      requestsRemaining: this.remainingQuota,
    };
  }
}
