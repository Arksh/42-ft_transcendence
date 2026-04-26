Base de datos creada en postgresSQL

Esta base de datos se va a crear de forma básica para gestionar usuarios, amigos, partidas, contrincantes, estadisticas y logros.

Estructura de cada tabla
	Usuarios
		id					creado automáticamente autoincremental
		username			nombre de usuario ÚNICO
		email				email de usuario ÚNICO
		password_hash		contraseña encriptada
		created_at			fecha de creación del usuario

	Amigos
		user_id
		friend_id
		created_at

	Partidas
		id
		game_mode
		players
		created_at
		status
		created_at
		started_at
		ended_at

	Contrincantes
		id
		match_id
		user_id
		score
		is_winner

	Estadisticas
		user_id
		games_played
		wins
		loses

	Logros


Relaciones
	user	->	friends
	user	->	contrincantes
	user	->	partidas 
	user	->	estadisticas



Iniciar docker desde docker-compose:
	sudo docker compose up -d postgres

Ver los datos en docker:
	Entrar al docker:
		sudo docker exec -it transcendence_postgres psql -U transcendence
	
	Entrar al docker desde cliente postgres
		Necesario instalar cliente
			sudo apt install postgresql-client-common
			sudo apt install postgresql-client
		sudo psql -h localhost -U transcendence -d transcendence
	
	\l
	\c transcendence
	\dt


Insertar o buscar datos
	Añadir usuario
		INSERT INTO users (id, username, email)
		VALUES ($1, $2, $3);


	Pasos al crear una partida
		Crear partida
			INSERT INTO matches (game_mode, max_players)
			VALUES ('my_game', 4)
			RETURNING id;

		Añadir usuario
			INSERT INTO match_players (match_id, user_id, position)
			VALUES ($1, $2, $3);

		Comprobar usuarios en partida
			SELECT COUNT(*) 
			FROM match_players
			WHERE match_id = $1;

		Iniciar partida
			UPDATE matches
			SET status = 'active',
				started_at = CURRENT_TIMESTAMP
			WHERE id = $1;

		Finalizar partida
			UPDATE matches
			SET status = 'finished',
				ended_at = CURRENT_TIMESTAMP
			WHERE id = $1;
		
		Marcar ganador
			UPDATE match_players
			SET is_winner = TRUE
			WHERE match_id = $1 AND user_id = $2;
		
		Incrementar partidas jugadas
			UPDATE stats
			SET games_played = games_played + 1
			WHERE user_id IN (
				SELECT user_id FROM match_players WHERE match_id = $1
			);
		
		Incrementar partidas ganadas
			UPDATE stats
			SET losses = losses + 1
			WHERE user_id IN (
				SELECT user_id FROM match_players 
				WHERE match_id = $1 AND is_winner = FALSE
			);
		
	Consulta de datos
		Ver partida con jugadores
			SELECT m.id, m.status, mp.user_id, mp.score, mp.is_winner
			FROM matches m
			JOIN match_players mp ON m.id = mp.match_id
			WHERE m.id = $1;

		Historial de partidas
			SELECT m.id, m.created_at, mp.score, mp.is_winner
			FROM match_players mp
			JOIN matches m ON mp.match_id = m.id
			WHERE mp.user_id = $1;

		Ranking
			SELECT u.username, s.wins, s.losses, s.elo
			FROM stats s
			JOIN users u ON u.id = s.user_id
			ORDER BY s.elo DESC;



Usar semilla sql para insertar datos
	docker exec -i transcendence_postgres psql -U transcendence -d transcendence < seed.sql

	O automatizar en docker
		volumes:
		- ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
		- ./db/seed.sql:/docker-entrypoint-initdb.d/seed.sql
	

Y revisar datos
	SELECT * FROM users;
	SELECT * FROM friendships;
	SELECT * FROM matches;
	SELECT * FROM match_players;
	ranking
		SELECT u.username, s.elo
		FROM users u
		JOIN stats s ON u.id = s.user_id
		ORDER BY s.elo DESC;
