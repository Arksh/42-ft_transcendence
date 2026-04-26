-- =========================
-- USERS
-- =========================

INSERT INTO users (id, username, email, password_hash, status)
VALUES
(1, 'alice', 'alice@test.com', NULL, 'online'),
(2, 'bob', 'bob@test.com', NULL, 'offline'),
(3, 'charlie', 'charlie@test.com', NULL, 'online'),
(4, 'david', 'david@test.com', NULL, 'offline'),
(5, 'eve', 'eve@test.com', NULL, 'online')
ON CONFLICT DO NOTHING;


-- =========================
-- STATS
-- =========================

INSERT INTO stats (user_id, games_played, wins, losses, elo)
VALUES
(1, 5, 3, 2, 1100),
(2, 4, 1, 3, 900),
(3, 6, 4, 2, 1200),
(4, 2, 0, 2, 800),
(5, 3, 2, 1, 1050)
ON CONFLICT DO NOTHING;


-- =========================
-- FRIENDSHIPS
-- =========================

INSERT INTO friendships (user_id, friend_id)
VALUES
(1, 2),
(2, 1),
(1, 3),
(3, 1),
(2, 4),
(4, 2)
ON CONFLICT DO NOTHING;


-- =========================
-- MATCHES
-- =========================

INSERT INTO matches (id, game_mode, max_players, status)
VALUES
(1, 'game_2p', 2, 'finished'),
(2, 'game_4p', 4, 'finished'),
(3, 'game_2p', 2, 'active')
ON CONFLICT DO NOTHING;


-- =========================
-- MATCH PLAYERS (2 jugadores)
-- =========================

INSERT INTO match_players (match_id, user_id, score, is_winner, position)
VALUES
(1, 1, 10, TRUE, 1),
(1, 2, 5, FALSE, 2)
ON CONFLICT DO NOTHING;


-- =========================
-- MATCH PLAYERS (4 jugadores)
-- =========================

INSERT INTO match_players (match_id, user_id, score, is_winner, position)
VALUES
(2, 1, 15, TRUE, 1),
(2, 2, 10, FALSE, 2),
(2, 3, 12, FALSE, 3),
(2, 4, 8, FALSE, 4)
ON CONFLICT DO NOTHING;


-- =========================
-- MATCH ACTIVA (test en vivo)
-- =========================

INSERT INTO match_players (match_id, user_id, score, is_winner, position)
VALUES
(3, 3, 3, FALSE, 1),
(3, 5, 2, FALSE, 2)
ON CONFLICT DO NOTHING;


-- =========================
-- ACHIEVEMENTS
-- =========================

INSERT INTO achievements (id, name, description)
VALUES
(1, 'First Win', 'Win your first match'),
(2, 'Pro Player', 'Win 10 matches'),
(3, 'Unstoppable', 'Win 5 matches in a row')
ON CONFLICT DO NOTHING;


-- =========================
-- USER ACHIEVEMENTS
-- =========================

INSERT INTO user_achievements (user_id, achievement_id)
VALUES
(1, 1),
(3, 1),
(3, 2)
ON CONFLICT DO NOTHING;