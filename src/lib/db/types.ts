// =====================================================================
// DATABASE ENTITY TYPES
// Mirrors the PostgreSQL / Supabase schema for STATXI
// =====================================================================

export interface GamePlayerPoolRecord {
  player_id: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  photo?: string | null;
  nationality: string;
  continent?: string | null;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  age: number;
  shirt_number?: number | null;

  club_id?: string | null;
  club_name?: string | null;
  club_logo?: string | null;
  competition_id?: string | null;
  competition_name?: string | null;
  season_year?: string | null;

  appearances: number | null;
  goals: number | null;
  assists: number | null;
  minutes: number | null;

  yellow_cards: number | null;
  red_cards: number | null;
  penalty_goals: number | null;

  shots: number | null;
  shots_on_target: number | null;
  passes: number | null;
  key_passes: number | null;
  pass_accuracy: number | null;
  dribbles: number | null;
  tackles: number | null;
  interceptions: number | null;

  titles: number;
  world_cup_goals: number;
  champions_league_goals: number;

  market_value: number | null;
  market_value_peak: number | null;

  career_goals?: number | null;
  career_assists?: number | null;
  career_appearances?: number | null;

  is_active: boolean;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  auth_user_id?: string | null;
  username: string;
  avatar: string;
  is_guest: boolean;
  xp: number;
  level: number;
  games_played: number;
  games_won: number;
  best_score: number;
  total_score: number;
  daily_streak: number;
  longest_streak: number;
  last_played_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface GameSessionRecord {
  id: string;
  game_type: string;
  user_id?: string | null;
  stat: string;
  competition_id?: string | null;
  season_id?: string | null;
  format: number;
  difficulty: string;
  seed?: string | null;
  rules?: Record<string, unknown> | null;
  started_at: string;
  completed_at?: string | null;
  score: number;
  xp_earned: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface GameAnswerRecord {
  id: string;
  game_session_id: string;
  round_number: number;
  player_id?: string | null;
  user_answer: unknown;
  correct_answer: unknown;
  is_correct: boolean;
  points: number;
  response_time_ms: number;
  created_at: string;
}

export interface DailyChallengeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  game_type: string;
  stat: string;
  difficulty: string;
  format: number;
  seed: string;
  config: Record<string, unknown>;
  created_at: string;
}

export interface DailyChallengeAttemptRecord {
  id: string;
  challenge_id: string;
  user_id: string;
  username: string;
  avatar: string;
  score: number;
  time_taken_seconds: number;
  completed_at: string;
}

export interface SyncLogRecord {
  id: string;
  provider: string;
  started_at: string;
  finished_at?: string | null;
  status: 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  requests_made: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_message?: string | null;
}

export interface SyncStateRecord {
  id: string;
  provider: string;
  entity: string;
  last_successful_sync: string | null;
  last_cursor: string | null;
  last_fixture_date: string | null;
  status: string;
}
