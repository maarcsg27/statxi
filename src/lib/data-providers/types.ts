// =====================================================================
// DATA PROVIDERS INTERFACES & DOMAIN TYPES
// Completely decouples the Application and Game Engine from specific APIs
// =====================================================================

export interface ExternalCompetition {
  id: number;
  name: string;
  country: string;
  continent?: string;
  type: 'league' | 'cup' | 'international';
  logo?: string;
}

export interface ExternalSeason {
  year: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface ExternalClub {
  id: number;
  name: string;
  country: string;
  continent?: string;
  logo?: string;
  founded?: number;
  stadium?: string;
}

export interface ExternalPlayer {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  nationality: string;
  birthDate?: string;
  age: number;
  height?: string;
  weight?: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  photo?: string;
  currentClubId?: number;
}

export interface ExternalSeasonStats {
  playerId: number;
  competitionId: number;
  seasonYear: string;

  appearances: number | null;
  starts: number | null;
  minutes: number | null;

  goals: number | null;
  assists: number | null;

  penaltyGoals: number | null;
  penaltyAttempts: number | null;
  penaltyMissed: number | null;

  shots: number | null;
  shotsOnTarget: number | null;

  passes: number | null;
  keyPasses: number | null;
  passAccuracy: number | null;

  dribbles: number | null;
  tackles: number | null;
  interceptions: number | null;

  duels: number | null;
  duelsWon: number | null;

  foulsCommitted: number | null;
  foulsDrawn: number | null;

  offsides: number | null;

  yellowCards: number | null;
  redCards: number | null;

  cleanSheets: number | null;
  saves: number | null;
  goalsConceded: number | null;

  rating: number | null;
}

export interface ExternalFixture {
  id: number;
  competitionId: number;
  seasonYear: string;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  round?: string;
  venue?: string;
}

export interface ExternalFixturePlayerStats {
  playerId: number;
  fixtureId: number;
  minutes: number | null;
  position?: string;
  rating: number | null;
  goals: number;
  assists: number;
  shots: number | null;
  shotsOnTarget: number | null;
  passes: number | null;
  keyPasses: number | null;
  passAccuracy: number | null;
  dribbles: number | null;
  tackles: number | null;
  interceptions: number | null;
  yellowCards: number;
  redCards: number;
}

export interface ExternalTransfer {
  playerId: number;
  fromClubId: number | null;
  toClubId: number | null;
  date: string;
  type: string;
  fee?: string;
}

export interface ExternalTrophy {
  playerId: number;
  competition: string;
  country?: string;
  season: string;
  place: 'Winner' | 'Runner-up';
  clubId?: number;
}

export interface QuotaInfo {
  requestsToday: number;
  dailyLimit: number;
  requestsRemaining: number;
  resetAt?: string;
}

export interface FootballDataProvider {
  readonly name: string;
  getCompetitions(): Promise<ExternalCompetition[]>;
  getSeasons(): Promise<ExternalSeason[]>;
  getTeams(competitionId: number, seasonYear: string): Promise<ExternalClub[]>;
  getPlayers(clubId: number, seasonYear: string): Promise<ExternalPlayer[]>;
  getFixtures(competitionId: number, seasonYear: string, fromDate?: string, toDate?: string): Promise<ExternalFixture[]>;
  getFixturePlayerStats(fixtureId: number): Promise<ExternalFixturePlayerStats[]>;
  getPlayerSeasonStats(playerId: number, seasonYear: string): Promise<ExternalSeasonStats[]>;
  getTransfers(playerId: number): Promise<ExternalTransfer[]>;
  getTrophies(playerId: number): Promise<ExternalTrophy[]>;
  getQuotaInfo(): Promise<QuotaInfo>;
}

export interface MarketValuePoint {
  date: string;
  value: number; // In EUR
  currency: string;
  clubId?: number;
}

export interface MarketValueProvider {
  readonly name: string;
  getPlayerMarketValue(playerId: number): Promise<MarketValuePoint | null>;
  getPlayerMarketValueHistory(playerId: number): Promise<MarketValuePoint[]>;
}
