// =====================================================================
// DATA REPOSITORY LAYER
// Seamlessly delegates to Supabase if connected or InMemory database
// =====================================================================

import { getSupabaseAdminClient } from './supabase';
import { inMemoryDb } from './in-memory-db';
import {
  GamePlayerPoolRecord,
  UserProfile,
  Achievement,
  GameSessionRecord,
  DailyChallengeRecord,
  DailyChallengeAttemptRecord,
  SyncLogRecord,
  SyncStateRecord,
} from './types';

export interface PoolFilterOptions {
  stat?: keyof GamePlayerPoolRecord;
  competitionId?: string;
  clubId?: string;
  nationality?: string;
  continent?: string;
  position?: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  seasonYear?: string;
  minAppearances?: number;
  limit?: number;
}

export class StatRepository {
  /**
   * Queries the game_player_pool with strict NULL filtering.
   * A player is excluded if the requested stat is NULL.
   */
  async queryGamePlayerPool(options: PoolFilterOptions = {}): Promise<GamePlayerPoolRecord[]> {
    const supabase = getSupabaseAdminClient();

    if (supabase) {
      try {
        let query = supabase.from('game_player_pool').select('*');

        if (options.stat) {
          query = query.not(options.stat as string, 'is', null);
        }
        if (options.competitionId) {
          query = query.eq('competition_id', options.competitionId);
        }
        if (options.clubId) {
          query = query.eq('club_id', options.clubId);
        }
        if (options.nationality) {
          query = query.eq('nationality', options.nationality);
        }
        if (options.continent) {
          query = query.eq('continent', options.continent);
        }
        if (options.position) {
          query = query.eq('position', options.position);
        }
        if (options.minAppearances) {
          query = query.gte('appearances', options.minAppearances);
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as GamePlayerPoolRecord[];
        }
      } catch (err) {
        console.warn('[Repository] Supabase query failed, falling back to local pool:', err);
      }
    }

    // In-memory fallback
    let pool = [...inMemoryDb.gamePlayerPool];

    if (options.stat) {
      const statKey = options.stat;
      pool = pool.filter((p) => p[statKey] !== null && p[statKey] !== undefined);
    }
    if (options.competitionId) {
      pool = pool.filter((p) => p.competition_id === options.competitionId);
    }
    if (options.clubId) {
      pool = pool.filter((p) => p.club_id === options.clubId);
    }
    if (options.nationality) {
      pool = pool.filter((p) => p.nationality.toLowerCase() === options.nationality?.toLowerCase());
    }
    if (options.continent) {
      pool = pool.filter((p) => p.continent?.toLowerCase() === options.continent?.toLowerCase());
    }
    if (options.position) {
      pool = pool.filter((p) => p.position === options.position);
    }
    if (options.minAppearances) {
      pool = pool.filter((p) => (p.appearances || 0) >= (options.minAppearances || 0));
    }
    if (options.limit) {
      pool = pool.slice(0, options.limit);
    }

    return pool;
  }

  async getPlayerById(playerId: string): Promise<GamePlayerPoolRecord | null> {
    const list = await this.queryGamePlayerPool();
    return list.find((p) => p.player_id === playerId) || null;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) return data as UserProfile;
      } catch {
        // Fallback
      }
    }
    return inMemoryDb.profiles.get(userId) || null;
  }

  async getOrCreateGuestProfile(guestId?: string): Promise<UserProfile> {
    const id = guestId || `guest-${Math.random().toString(36).substring(2, 9)}`;
    let profile = await this.getProfile(id);
    if (!profile) {
      profile = {
        id,
        username: `Crack_${id.slice(-4)}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        is_guest: true,
        xp: 0,
        level: 1,
        games_played: 0,
        games_won: 0,
        best_score: 0,
        total_score: 0,
        daily_streak: 1,
        longest_streak: 1,
        last_played_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryDb.profiles.set(id, profile);
    }
    return profile;
  }

  async updateProfileProgress(
    userId: string,
    score: number,
    xpEarned: number,
    isWin: boolean
  ): Promise<UserProfile> {
    let profile = (await this.getProfile(userId)) || (await this.getOrCreateGuestProfile(userId));

    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.daily_streak;

    if (profile.last_played_date) {
      const lastDate = new Date(profile.last_played_date);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newXp = profile.xp + xpEarned;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);

    profile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      games_played: profile.games_played + 1,
      games_won: profile.games_won + (isWin ? 1 : 0),
      best_score: Math.max(profile.best_score, score),
      total_score: profile.total_score + score,
      daily_streak: newStreak,
      longest_streak: Math.max(profile.longest_streak, newStreak),
      last_played_date: today,
      updated_at: new Date().toISOString(),
    };

    inMemoryDb.profiles.set(userId, profile);
    return profile;
  }

  async getLeaderboard(type: 'global' | 'weekly' | 'daily' = 'global'): Promise<UserProfile[]> {
    const list = Array.from(inMemoryDb.profiles.values());
    if (type === 'daily') {
      return [...list].sort((a, b) => b.best_score - a.best_score);
    }
    return [...list].sort((a, b) => b.xp - a.xp);
  }

  async getAchievements(): Promise<Achievement[]> {
    return inMemoryDb.achievements;
  }

  async getUserAchievements(userId: string): Promise<string[]> {
    return inMemoryDb.userAchievements
      .filter((ua) => ua.user_id === userId)
      .map((ua) => ua.achievement_id);
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const existing = inMemoryDb.userAchievements.find(
      (ua) => ua.user_id === userId && ua.achievement_id === achievementId
    );
    if (existing) return false;

    inMemoryDb.userAchievements.push({
      id: `ua-${Date.now()}`,
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    });
    return true;
  }

  async saveGameSession(session: GameSessionRecord): Promise<void> {
    inMemoryDb.gameSessions.set(session.id, session);
  }

  async getDailyChallenge(date: string): Promise<DailyChallengeRecord | null> {
    return inMemoryDb.dailyChallenges.get(date) || null;
  }

  async saveDailyChallenge(challenge: DailyChallengeRecord): Promise<void> {
    inMemoryDb.dailyChallenges.set(challenge.date, challenge);
  }

  async getDailyAttempts(challengeId: string): Promise<DailyChallengeAttemptRecord[]> {
    return inMemoryDb.dailyAttempts.get(challengeId) || [];
  }

  async recordDailyAttempt(attempt: DailyChallengeAttemptRecord): Promise<void> {
    const attempts = inMemoryDb.dailyAttempts.get(attempt.challenge_id) || [];
    const filtered = attempts.filter((a) => a.user_id !== attempt.user_id);
    filtered.push(attempt);
    filtered.sort((a, b) => b.score - a.score || a.time_taken_seconds - b.time_taken_seconds);
    inMemoryDb.dailyAttempts.set(attempt.challenge_id, filtered);
  }

  async getSyncLogs(): Promise<SyncLogRecord[]> {
    return inMemoryDb.syncLogs;
  }

  async recordSyncLog(log: SyncLogRecord): Promise<void> {
    inMemoryDb.syncLogs.unshift(log);
    if (inMemoryDb.syncLogs.length > 50) {
      inMemoryDb.syncLogs.pop();
    }
  }

  async getSyncState(): Promise<SyncStateRecord[]> {
    return Array.from(inMemoryDb.syncState.values());
  }
}

export const statRepository = new StatRepository();
