-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,

    avatar_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FRIENDSHIPS
-- =========================

CREATE TABLE IF NOT EXISTS friendships (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, friend_id)
);

-- =========================
-- MATCHES
-- =========================

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,

    game_mode VARCHAR(50) NOT NULL,
    max_players INT DEFAULT 4,

    status VARCHAR(20) DEFAULT 'waiting',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

-- =========================
-- MATCH PLAYERS
-- =========================

CREATE TABLE IF NOT EXISTS match_players (
    id SERIAL PRIMARY KEY,

    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,

    score INT DEFAULT 0,
    position INT,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(match_id, user_id)
);

-- =========================
-- STATS
-- =========================

CREATE TABLE IF NOT EXISTS stats (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    games_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,

    elo INT DEFAULT 1000
);

-- =========================
-- OPTIONAL: ACHIEVEMENTS (gamification)
-- =========================

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,

    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, achievement_id)
);