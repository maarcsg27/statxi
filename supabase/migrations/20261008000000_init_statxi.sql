-- =====================================================================
-- STATXI (Stat-XI) - SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Comprehensive football statistical minigames database architecture
-- =====================================================================

-- 1. COMPETITIONS
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_football_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    continent VARCHAR(50),
    type VARCHAR(50) DEFAULT 'league', -- league, cup, international
    logo TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SEASONS
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year VARCHAR(20) NOT NULL UNIQUE, -- e.g. "2024/25", "2023/24"
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE
);

-- 3. CLUBS
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_football_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    continent VARCHAR(50),
    logo TEXT,
    founded INTEGER,
    stadium VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLAYERS
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_football_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nationality VARCHAR(100),
    birth_date DATE,
    age INTEGER,
    height VARCHAR(20),
    weight VARCHAR(20),
    position VARCHAR(50), -- Goalkeeper, Defender, Midfielder, Attacker
    photo TEXT,
    current_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PLAYER SEASON STATS
-- Note: NULL means "no data available", 0 means "known 0"
CREATE TABLE IF NOT EXISTS player_season_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,

    appearances INTEGER,
    starts INTEGER,
    minutes INTEGER,

    goals INTEGER,
    assists INTEGER,

    penalty_goals INTEGER,
    penalty_attempts INTEGER,
    penalty_missed INTEGER,

    shots INTEGER,
    shots_on_target INTEGER,

    passes INTEGER,
    key_passes INTEGER,
    pass_accuracy NUMERIC(5,2),

    dribbles INTEGER,
    tackles INTEGER,
    interceptions INTEGER,

    duels INTEGER,
    duels_won INTEGER,

    fouls_committed INTEGER,
    fouls_drawn INTEGER,

    offsides INTEGER,

    yellow_cards INTEGER,
    red_cards INTEGER,

    clean_sheets INTEGER,
    saves INTEGER,
    goals_conceded INTEGER,

    rating NUMERIC(4,2),

    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_player_comp_season UNIQUE (player_id, competition_id, season_id)
);

-- 6. FIXTURES
CREATE TABLE IF NOT EXISTS fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_football_id INTEGER UNIQUE,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    home_team_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'FT', -- FT, LIVE, NS, etc.
    home_score INTEGER,
    away_score INTEGER,
    round VARCHAR(100),
    venue VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLAYER MATCH STATS
CREATE TABLE IF NOT EXISTS player_match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,

    minutes INTEGER,
    position VARCHAR(50),
    rating NUMERIC(4,2),

    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,

    shots INTEGER,
    shots_on_target INTEGER,

    passes INTEGER,
    key_passes INTEGER,
    pass_accuracy NUMERIC(5,2),

    dribbles INTEGER,
    tackles INTEGER,
    interceptions INTEGER,

    duels INTEGER,
    duels_won INTEGER,

    fouls_committed INTEGER,
    fouls_drawn INTEGER,

    offsides INTEGER,

    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,

    penalty_won INTEGER,
    penalty_committed INTEGER,
    penalty_scored INTEGER,
    penalty_missed INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_player_fixture UNIQUE (player_id, fixture_id)
);

-- 8. NATIONAL TEAM STATS
CREATE TABLE IF NOT EXISTS national_team_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    appearances INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    world_cup_appearances INTEGER DEFAULT 0,
    world_cup_goals INTEGER DEFAULT 0,
    euro_appearances INTEGER DEFAULT 0,
    euro_goals INTEGER DEFAULT 0,
    copa_america_appearances INTEGER DEFAULT 0,
    copa_america_goals INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_player_country UNIQUE (player_id, country)
);

-- 9. PLAYER TROPHIES
CREATE TABLE IF NOT EXISTS player_trophies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    competition VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    season VARCHAR(50) NOT NULL,
    place VARCHAR(50) DEFAULT 'Winner', -- Winner, Runner-up
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    source VARCHAR(100) DEFAULT 'api_football',
    CONSTRAINT uq_player_trophy UNIQUE (player_id, competition, season, place)
);

-- 10. PLAYER TRANSFERS
CREATE TABLE IF NOT EXISTS player_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    from_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    to_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    date DATE,
    type VARCHAR(100), -- Free, Loan, Sold
    fee VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PLAYER MARKET VALUES (Historical)
CREATE TABLE IF NOT EXISTS player_market_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value NUMERIC(14,2) NOT NULL, -- Value in EUR
    currency VARCHAR(10) DEFAULT 'EUR',
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    source VARCHAR(100) DEFAULT 'highlightly',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_player_mv_date UNIQUE (player_id, date)
);
CREATE INDEX IF NOT EXISTS idx_player_market_values_player_date ON player_market_values(player_id, date DESC);

-- 12. EXTERNAL IDS (Provider Agnostic Mapping)
CREATE TABLE IF NOT EXISTS external_ids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- player, club, competition
    internal_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL, -- api_football, highlightly, transfermarkt
    external_id VARCHAR(100) NOT NULL,
    CONSTRAINT uq_provider_external_id UNIQUE (provider, entity_type, external_id)
);
CREATE INDEX IF NOT EXISTS idx_external_ids_lookup ON external_ids(entity_type, internal_id);

-- 13. SYNC STATE (Incremental Tracking)
CREATE TABLE IF NOT EXISTS sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL, -- fixtures, players, stats, market_values
    last_successful_sync TIMESTAMPTZ,
    last_cursor VARCHAR(255),
    last_fixture_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'IDLE',
    CONSTRAINT uq_provider_entity UNIQUE (provider, entity)
);

-- 14. SYNC LOGS
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING', -- RUNNING, SUCCESS, PARTIAL, FAILED
    requests_made INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT
);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- 15. GAME PLAYER POOL (Denormalized high-performance pool for games)
CREATE TABLE IF NOT EXISTS game_player_pool (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    photo TEXT,
    nationality VARCHAR(100),
    continent VARCHAR(50),
    position VARCHAR(50),
    age INTEGER,
    shirt_number INTEGER,

    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    club_name VARCHAR(255),
    club_logo TEXT,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    competition_name VARCHAR(255),
    season_year VARCHAR(20),

    appearances INTEGER,
    goals INTEGER,
    assists INTEGER,
    minutes INTEGER,

    yellow_cards INTEGER,
    red_cards INTEGER,
    penalty_goals INTEGER,

    shots INTEGER,
    shots_on_target INTEGER,
    passes INTEGER,
    key_passes INTEGER,
    pass_accuracy NUMERIC(5,2),
    dribbles INTEGER,
    tackles INTEGER,
    interceptions INTEGER,

    titles INTEGER DEFAULT 0,
    world_cup_goals INTEGER DEFAULT 0,
    champions_league_goals INTEGER DEFAULT 0,

    market_value NUMERIC(14,2), -- latest market value in EUR
    market_value_peak NUMERIC(14,2),

    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for instant game queries
CREATE INDEX IF NOT EXISTS idx_gpp_competition ON game_player_pool(competition_id);
CREATE INDEX IF NOT EXISTS idx_gpp_club ON game_player_pool(club_id);
CREATE INDEX IF NOT EXISTS idx_gpp_nationality ON game_player_pool(nationality);
CREATE INDEX IF NOT EXISTS idx_gpp_position ON game_player_pool(position);
CREATE INDEX IF NOT EXISTS idx_gpp_goals ON game_player_pool(goals DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_gpp_assists ON game_player_pool(assists DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_gpp_market_value ON game_player_pool(market_value DESC NULLS LAST);

-- 16. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- references auth.users in Supabase
    username VARCHAR(100) UNIQUE NOT NULL,
    avatar TEXT,
    is_guest BOOLEAN DEFAULT FALSE,

    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,

    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_score BIGINT DEFAULT 0,

    daily_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_played_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    xp_reward INTEGER DEFAULT 100,
    category VARCHAR(50) DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

-- 18. GAME SESSIONS
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    stat VARCHAR(50) NOT NULL,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,

    format INTEGER DEFAULT 1, -- 1, 2, 5, 7, 11
    difficulty VARCHAR(20) DEFAULT 'medium',

    seed VARCHAR(100),
    rules JSONB,

    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. GAME ANSWERS (Audit & Analytics)
CREATE TABLE IF NOT EXISTS game_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    user_answer JSONB NOT NULL,
    correct_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. DAILY CHALLENGES (Deterministic by Date)
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    game_type VARCHAR(50) NOT NULL,
    stat VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    format INTEGER DEFAULT 5,
    seed VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_challenge_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    answers JSONB,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_daily_user_attempt UNIQUE (challenge_id, user_id)
);

-- 21. CUSTOM GAMES (Shareable URLs)
CREATE TABLE IF NOT EXISTS custom_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code VARCHAR(20) UNIQUE NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    game_type VARCHAR(50) NOT NULL,
    stat VARCHAR(50) NOT NULL,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    format INTEGER DEFAULT 5,
    difficulty VARCHAR(20) DEFAULT 'medium',
    seed VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- DATABASE FUNCTIONS & VIEWS
-- =====================================================================

-- Function to recalculate game_player_pool from underlying tables
CREATE OR REPLACE FUNCTION refresh_game_player_pool()
RETURNS VOID AS $$
BEGIN
    INSERT INTO game_player_pool (
        player_id, name, first_name, last_name, photo, nationality, position, age,
        club_id, club_name, club_logo,
        appearances, goals, assists, minutes, yellow_cards, red_cards,
        penalty_goals, shots, shots_on_target, passes, key_passes, pass_accuracy,
        dribbles, tackles, interceptions,
        market_value, updated_at
    )
    SELECT
        p.id AS player_id,
        p.name,
        p.first_name,
        p.last_name,
        p.photo,
        p.nationality,
        p.position,
        p.age,
        c.id AS club_id,
        c.name AS club_name,
        c.logo AS club_logo,
        SUM(pss.appearances) AS appearances,
        SUM(pss.goals) AS goals,
        SUM(pss.assists) AS assists,
        SUM(pss.minutes) AS minutes,
        SUM(pss.yellow_cards) AS yellow_cards,
        SUM(pss.red_cards) AS red_cards,
        SUM(pss.penalty_goals) AS penalty_goals,
        SUM(pss.shots) AS shots,
        SUM(pss.shots_on_target) AS shots_on_target,
        SUM(pss.passes) AS passes,
        SUM(pss.key_passes) AS key_passes,
        AVG(pss.pass_accuracy) AS pass_accuracy,
        SUM(pss.dribbles) AS dribbles,
        SUM(pss.tackles) AS tackles,
        SUM(pss.interceptions) AS interceptions,
        (SELECT mv.value FROM player_market_values mv WHERE mv.player_id = p.id ORDER BY mv.date DESC LIMIT 1) AS market_value,
        NOW() AS updated_at
    FROM players p
    LEFT JOIN clubs c ON p.current_club_id = c.id
    LEFT JOIN player_season_stats pss ON pss.player_id = p.id
    GROUP BY p.id, c.id
    ON CONFLICT (player_id) DO UPDATE SET
        name = EXCLUDED.name,
        photo = EXCLUDED.photo,
        club_id = EXCLUDED.club_id,
        club_name = EXCLUDED.club_name,
        club_logo = EXCLUDED.club_logo,
        appearances = EXCLUDED.appearances,
        goals = EXCLUDED.goals,
        assists = EXCLUDED.assists,
        minutes = EXCLUDED.minutes,
        yellow_cards = EXCLUDED.yellow_cards,
        red_cards = EXCLUDED.red_cards,
        penalty_goals = EXCLUDED.penalty_goals,
        shots = EXCLUDED.shots,
        shots_on_target = EXCLUDED.shots_on_target,
        passes = EXCLUDED.passes,
        key_passes = EXCLUDED.key_passes,
        pass_accuracy = EXCLUDED.pass_accuracy,
        dribbles = EXCLUDED.dribbles,
        tackles = EXCLUDED.tackles,
        interceptions = EXCLUDED.interceptions,
        market_value = EXCLUDED.market_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
