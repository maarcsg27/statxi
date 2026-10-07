// =====================================================================
// IN-MEMORY STORAGE ENGINE
// Provides high-performance in-memory cache and local fallback.
// Ensures STATXI is 100% playable immediately out of the box.
// =====================================================================

import {
  GamePlayerPoolRecord,
  UserProfile,
  Achievement,
  UserAchievement,
  GameSessionRecord,
  DailyChallengeRecord,
  DailyChallengeAttemptRecord,
  SyncLogRecord,
  SyncStateRecord,
} from './types';
import { MOCK_SEED_PLAYERS, MOCK_CLUBS } from '../data-providers/mock/mock-football-provider';

function transformMockToPool(): GamePlayerPoolRecord[] {
  return MOCK_SEED_PLAYERS.map((s) => {
    const club = MOCK_CLUBS.find((c) => c.id === s.player.currentClubId);
    return {
      player_id: `p-${s.player.id}`,
      name: s.player.name,
      first_name: s.player.firstName,
      last_name: s.player.lastName,
      photo: s.player.photo,
      nationality: s.player.nationality,
      continent: club?.continent || 'Europe',
      position: s.player.position,
      age: s.player.age,
      shirt_number: Math.floor(Math.random() * 20) + 1,

      club_id: club ? `c-${club.id}` : null,
      club_name: club?.name || null,
      club_logo: club?.logo || null,
      competition_id: `comp-${s.stats2024.competitionId}`,
      competition_name: s.stats2024.competitionId === 140 ? 'LaLiga' : s.stats2024.competitionId === 39 ? 'Premier League' : 'Bundesliga',
      season_year: '2024/25',

      appearances: s.stats2024.appearances,
      goals: s.stats2024.goals,
      assists: s.stats2024.assists,
      minutes: s.stats2024.minutes,

      yellow_cards: s.stats2024.yellowCards,
      red_cards: s.stats2024.redCards,
      penalty_goals: s.stats2024.penaltyGoals,

      shots: s.stats2024.shots,
      shots_on_target: s.stats2024.shotsOnTarget,
      passes: s.stats2024.passes,
      key_passes: s.stats2024.keyPasses,
      pass_accuracy: s.stats2024.passAccuracy,
      dribbles: s.stats2024.dribbles,
      tackles: s.stats2024.tackles,
      interceptions: s.stats2024.interceptions,

      titles: s.titles,
      world_cup_goals: s.worldCupGoals,
      champions_league_goals: s.championsLeagueGoals,

      market_value: s.marketValue,
      market_value_peak: s.marketValuePeak,

      career_goals: s.careerGoals,
      career_assists: s.careerAssists,
      career_appearances: s.careerAppearances,

      is_active: true,
      updated_at: new Date().toISOString(),
    };
  });
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_MATCH', name: 'Debut Profesional', description: 'Completa tu primera partida en STATXI', icon: 'zap', xp_reward: 100, category: 'general' },
  { id: 'SNIPER_ACCURACY', name: 'Tirador de Élite', description: 'Acierta el 100% de preguntas en una partida', icon: 'target', xp_reward: 250, category: 'skill' },
  { id: 'DAILY_MASTER', name: 'Reto Diario Completado', description: 'Completa el Daily Challenge del día', icon: 'calendar', xp_reward: 200, category: 'daily' },
  { id: 'STREAK_7', name: 'Semana de Oro', description: 'Mantén una racha activa durante 7 días consecutivos', icon: 'flame', xp_reward: 500, category: 'streak' },
  { id: 'STAT_GEEK', name: 'Míster Big Data', description: 'Acumula más de 5,000 puntos en un solo juego', icon: 'brain', xp_reward: 350, category: 'score' },
  { id: 'DRAFT_XI', name: 'Director Deportivo', description: 'Completa un modo Draft con rating de 85+', icon: 'users', xp_reward: 300, category: 'draft' },
  { id: 'MARKET_TYCOON', name: 'Magnate de Fichajes', description: 'Acierta 5 valores de mercado seguidos en Higher/Lower', icon: 'dollar-sign', xp_reward: 400, category: 'skill' },
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'u-1',
    username: 'StatKing_07',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    is_guest: false,
    xp: 8420,
    level: 12,
    games_played: 64,
    games_won: 51,
    best_score: 9850,
    total_score: 412000,
    daily_streak: 14,
    longest_streak: 14,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u-2',
    username: 'GoldenXI_Tactics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    is_guest: false,
    xp: 6150,
    level: 9,
    games_played: 45,
    games_won: 34,
    best_score: 8720,
    total_score: 305400,
    daily_streak: 6,
    longest_streak: 9,
    created_at: '2026-09-15T12:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u-3',
    username: 'LaLigaAnalyst',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    is_guest: false,
    xp: 4900,
    level: 8,
    games_played: 38,
    games_won: 29,
    best_score: 7900,
    total_score: 221000,
    daily_streak: 3,
    longest_streak: 8,
    created_at: '2026-09-20T15:00:00Z',
    updated_at: new Date().toISOString(),
  },
];

class InMemoryDatabase {
  gamePlayerPool: GamePlayerPoolRecord[] = transformMockToPool();
  profiles: Map<string, UserProfile> = new Map(INITIAL_PROFILES.map((p) => [p.id, p]));
  achievements: Achievement[] = INITIAL_ACHIEVEMENTS;
  userAchievements: UserAchievement[] = [
    { id: 'ua-1', user_id: 'u-1', achievement_id: 'FIRST_MATCH', unlocked_at: '2026-09-01T10:05:00Z' },
    { id: 'ua-2', user_id: 'u-1', achievement_id: 'DAILY_MASTER', unlocked_at: '2026-09-02T12:00:00Z' },
    { id: 'ua-3', user_id: 'u-1', achievement_id: 'STREAK_7', unlocked_at: '2026-09-08T09:00:00Z' },
    { id: 'ua-4', user_id: 'u-2', achievement_id: 'FIRST_MATCH', unlocked_at: '2026-09-15T12:10:00Z' },
  ];
  gameSessions: Map<string, GameSessionRecord> = new Map();
  dailyChallenges: Map<string, DailyChallengeRecord> = new Map();
  dailyAttempts: Map<string, DailyChallengeAttemptRecord[]> = new Map();
  syncLogs: SyncLogRecord[] = [
    {
      id: 'log-1',
      provider: 'api_football',
      started_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      finished_at: new Date(Date.now() - 3600000 * 4 + 45000).toISOString(),
      status: 'SUCCESS',
      requests_made: 18,
      records_created: 4,
      records_updated: 22,
      records_failed: 0,
      error_message: null,
    },
  ];
  syncState: Map<string, SyncStateRecord> = new Map([
    [
      'fixtures',
      {
        id: 'st-1',
        provider: 'api_football',
        entity: 'fixtures',
        last_successful_sync: new Date(Date.now() - 3600000 * 4).toISOString(),
        last_cursor: '140-2024',
        last_fixture_date: '2024-10-26T21:00:00Z',
        status: 'IDLE',
      },
    ],
  ]);
}

// Global singleton across hot-reloads
const globalForDb = globalThis as unknown as { inMemoryDb?: InMemoryDatabase };
export const inMemoryDb = globalForDb.inMemoryDb || new InMemoryDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.inMemoryDb = inMemoryDb;
