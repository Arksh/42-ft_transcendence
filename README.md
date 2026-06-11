*This project has been created as part of the 42 curriculum by cagonzal, fraalmei, jrollon-, samartin, and dyunta.*

# Great Risk — ft_transcendence

## Description

**Great Risk** is a turn-based multiplayer strategy game inspired by the classic board game *Risk*, set in a stylised map of Europe. Players take control of one of six historical factions and compete for territorial dominance through reinforcement, attack, and fortification phases. The web application is built as a real-time, multi-user platform with persistent accounts, match history, achievements, and in-game chat.

This project is our team's submission for the 42 `ft_transcendence` final project of the Common Core.

### Key features

- **Real-time multiplayer strategy game** — up to 4 players per match, 45 territories across Europe, turn-based phases (Reinforce -> Attack -> Fortify).
- **Dice-based combat** — classic Risk-style attacker/defender dice resolution.
- **Win conditions** — capital conquest, total domination, or score-based victory at the 100-turn cap.
- **6 playable factions** — France, Spain, England, Austria, Russia, and the Ottomans.
- **Persistent user accounts** — registration, login, profile.
- **Match history & statistics** — implemented only in database.
- **Achievements system** — unlockable achievements tracked per user.
- **In-game chat** — real-time messaging between players in a match.
- **Lobby system** — create / join rooms and pick a faction.
- **Privacy Policy & Terms of Service** — accessible from a persistent footer on every page.

---

## Instructions

### Prerequisites

- **Docker** (≥ 24.x) and **Docker Compose** (v2).
- **GNU Make** (optional, but the project ships with a `Makefile` that wraps Docker commands).
- A POSIX shell (Linux / macOS / WSL2).
- For local (non-Docker) development only: **Node.js 20+** and **npm 10+**.

### Environment setup

The project reads configuration from a `.env` file at the project root. This file is **not** committed to Git. A reference template is provided as `.env.example` — copy it and adjust values for your environment:

```bash
cp .env.example .env
```

Required variables (see `.env.example` for the full list):

| Variable             | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `POSTGRES_USER`      | PostgreSQL user used by the database service         |
| `POSTGRES_PASSWORD`  | PostgreSQL password                                  |
| `POSTGRES_DB`        | Database name                                        |
| `POSTGRES_HOST`      | DB host (use `postgres` inside Docker network)       |
| `POSTGRES_PORT`      | DB port (default `5432`)                             |
| `DB_PORT`            | Exposed DB port on the host                          |
| `PRISMA_PORT`        | Port for the Prisma/Express data API (default `4000`)|

### Running the project

The entire stack runs with a single command:

```bash
make up
```

This builds and starts the following containers in detached mode:

- `client` — React frontend served by Nginx on **https://localhost**
- `engine` — game-logic REST API on **:3000**
- `realtime` — WebSocket server on **:42069**
- `database` — Prisma/Express REST API on **:4000**
- `postgres` — PostgreSQL 16 on **:5432**
- `redis` — Redis 7 (pub/sub backbone for real-time sync)

Useful Make targets:

| Command          | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `make up`        | Build + start all containers (detached)                     |
| `make down`      | Stop containers, keep DB data                               |
| `make logs`      | Tail logs from all services                                 |
| `make ps`        | List running containers                                     |
| `make clean`     | Stop + remove this project's images and build cache         |
| `make clean-data`| Stop and **wipe** the Postgres volume (destructive)         |
| `make fclean`    | Full reset (containers, images, volumes)                    |
| `make re`        | `fclean` then `up`                                          |
| `make exec-db`   | Open `psql` inside the running Postgres container           |

If you don't have `make`, the equivalent raw command is:

```bash
bash ./scripts/generate-env.sh && docker compose up --build -d
```

Once the stack is up, open **https://localhost** in Google Chrome (the project targets the latest stable Chrome per the subject).

---

## Resources

### Documentation & references

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/docs)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)
- [`ws` WebSocket library](https://github.com/websockets/ws)
- [Redis Pub/Sub](https://redis.io/docs/latest/develop/interact/pubsub/)
- [Docker Compose](https://docs.docker.com/compose/)
- [42 `ft_transcendence` subject (`en.subject.pdf`)](./en.subject.pdf)

### AI usage

AI tools (LLM-based coding assistants) were used during the project for the following tasks:

- Generating boilerplate and scaffolding (initial component templates, Docker Compose skeleton, README structure).
- Drafting and reformatting documentation, including this README.
- Explaining unfamiliar APIs and debugging stack traces.
- Reviewing diffs and suggesting refactors.

All AI-generated output was reviewed, tested, and adapted by the team before being merged. No code was committed without a human author understanding and being able to defend it during evaluation, in line with the AI guidelines in Chapter I of the subject.

---

## Team Information

> **TODO (team):** confirm the role assignments below. The subject (Chapter II) requires PO, PM/Scrum Master, Tech Lead/Architect, and Developers. With 5 members each role can be dedicated.

| Member       | Role(s)                                  | Responsibilities                                        |
| ------------ | ---------------------------------------- | ------------------------------------------------------- |
| **cagonzal** | Product Owner, game developer            | Designer and developer of the main game Great Risk      |
|              |                                          | using NodeJS/React                                      |
| **fraalmei** | Developer                                | Database configuration, ORM, database conection tool    |
| **jrollon-** | Developer                                | Login and registry front-end, authorization database    |
|              |                                          | management, Privacy Policy & Terms of Service, QA       |
| **samartin** | Scrum Master, developer                  | https with NginX management, QA, documentation          |
| **dyunta**   | Tech Lead                                | Backend realtime, API, global design                    |

---

## Project Management

- **Task organization:** Github, Discord and Slack notes.
- **Code review:** Pull Request based, reviewed by at least one other team member before merging to `main`.
- **Meetings:** Presential, weekly
- **Communication channels:** Discord, Slack.
- **Work breakdown:** mandatory part + modules split per member; see *Individual Contributions* below.

---

## Technical Stack

| Layer            | Technology                                  | Why                                                                                              |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Frontend         | **React 19 + Vite**                         | Mature SPA framework; fast dev loop and HMR via Vite; component model fits view-based game UI.   |
| Backend (data)   | **Express 5 + Prisma**                      | Lightweight HTTP API, JS across the stack, Prisma gives a type-safe ORM with migrations.        |
| Backend (engine) | **Express 5**                               | Stateless REST API holding the authoritative game-logic implementation.                          |
| Real-time        | **`ws` (WebSocket) + Redis Pub/Sub**        | Required by subject; Redis fan-out lets multiple clients in the same match stay in sync.         |
| Database         | **PostgreSQL 16**                           | Relational data fits users / matches / achievements; well-defined schema and strong constraints. |
| Containerization | **Docker + Docker Compose**                 | Required by subject; reproducible one-command deployment of the full multi-service stack.         |
| Web server       | **Nginx** (production frontend)             | Serves the built Vite bundle inside the `client` container.                                      |
| Styling          | **Inline styles + plain CSS**               | Lightweight; no framework dependency.                                                            |
| Authentication   | **Email + password (scrypt hashing)**       | Meets the subject's minimum auth requirement with salted/hashed passwords.                       |
| Shared rules     | **`@trascendence/shared` workspace**        | Single source of truth for territories, factions, turn logic, victory rules, and achievements.   |

The repo is organised as an **npm workspace monorepo** with the following packages: `client`, `database`, `engine`, `realtime`, `shared`, `gaming`.

---

## Database Schema

Source of truth: [`database/prisma/schema.prisma`](./database/prisma/schema.prisma).

| Model              | Purpose                                                              | Key fields                                                                         |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `User`             | Registered account                                                   | `username` (PK), `email` (unique), `passwordHash`, `avatarUrl`, `createdAt`        |
| `Friendship`       | Directed friend relation between two users                           | `(userUsername, friendUsername)` composite PK, `createdAt`                         |
| `Match`            | A single game session                                                | `id`, `gameMode`, `maxPlayers`, `status`, `gameState` (JSON), timestamps           |
| `MatchPlayer`      | Participation of a user in a match                                   | `(matchId, username)` unique, `score`, `position`, `joinedAt`                      |
| `Stat`             | Aggregated per-user stats                                            | `username` (PK/FK), `gamesPlayed`, `wins`, `losses`, `elo`                         |
| `Achievement`      | Definition of an achievement                                         | `id`, `nameId` (unique), `name`, `description`                                     |
| `UserAchievement`  | Unlock record (which user unlocked which achievement and when)       | `(username, achievementNameId)` PK, `unlockedAt`                                   |

### Relationships

- `User 1—N MatchPlayer N—1 Match` (a user plays in many matches; a match has many players).
- `User 1—1 Stat` (each user has exactly one aggregated stats row).
- `User N—M Achievement` via `UserAchievement`.
- `User N—M User` via `Friendship` (self-relation, non-bidirectional).

---

## Features List

| Feature                          | Description                                                                                        | Contributor(s) |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| Authentication                   | Email + password registration and login with scrypt-hashed credentials                             | jrollon-         |
| Lobby                            | Create or join game rooms, pick a faction, see other players                                       | cagonzal         |
| Game board                       | Canvas-based map of Europe, 45 territories, faction control                                        | cagonzal         |
| Turn engine                      | Reinforce / Attack / Fortify phases, 100-turn cap                                                  | cagonzal         |
| Dice combat                      | Risk-style attacker vs defender dice rolls and territory transfers                                 | cagonzal         |
| Victory conditions               | Capital conquest, full elimination, score-based win at turn cap                                    | cagonzal         |
| Real-time sync                   | WebSocket + Redis pub/sub to broadcast game-state updates                                          | dyunta           |
| In-match chat                    | Real-time text messages between players in the same match                                          | dyunta, jrollon- |
| Match history                    | Past matches per user, with results                                                                | dyunta           |
| Stats & ELO                      | Wins / losses / games played / ELO ranking per user                                                | fraalmei         |
| Achievements                     | Unlockable achievements with in-game notifications                                                 | cagonzal         |
| Privacy Policy / Terms of Service| Dedicated pages, linked from a footer that is persistent across **every** view                    | jrollon-         |
| Multi-user concurrency           | Multiple users logged in simultaneously, concurrent matches, real-time state propagation           | dyunta         |

---

## Modules

| Module                                            | Type   | Points | Justification                                                                       | Contributor(s)    |
| ------------------------------------------------- | ------ | :----: | ----------------------------------------------------------------------------------- | ----------------- |
| Web — Use a frontend framework (React)            | Minor  |   1    | React 19 + Vite SPA                                                                 | cagonzal, jrollon-|
| Web — Use a backend framework (Express)           | Minor  |   1    | Two Express services (`engine`, `database`)                                         | dyunta            |
| Web — Real-time features (WebSockets)             | Major  |   2    | `ws` + Redis pub/sub power live game-state sync and chat                            | dyunta            |
| Web — Use an ORM                                  | Minor  |   1    | Prisma ORM with migrations on PostgreSQL                                            | fraalmei          |
| User Management — Standard user management & auth | Major  |   2    | Register, login, profile, avatar, friend list with online status                    | jrollon-          |
| User Management — Game stats & match history      | Minor  |   1    | `Stat` and `Match`/`MatchPlayer` models; per-user wins/losses                       | fraalmei          |
| Gaming — Web-based game (Great Risk)              | Major  |   2    | Original turn-based strategy game with clear rules and win conditions               | cagonzal          |
| Gaming — Remote players                           | Major  |   2    | Two or more players on separate machines play the same match in real time           | cagonzal          |
| Gaming — Multiplayer (3+)                         | Major  |   2    | Up to 6 players per match, synchronised across all clients                          | cagonzal          |
| Gaming and UX — Gamification (achievements)       | Minor  |   1    | Persistent achievement system with in-game notifications                            | cagonzal          |
| User interaction — Basic chat in game             | Major  |   2    | Allowing users to interact with each other through messages         |

**Candidate total: ~ 14 points** (adjust as needed; the subject recommends aiming above 14 to cover any module that fails review).

---

## Individual Contributions

> **TODO (team):** fill in each member's detailed contributions, the modules and features they led, and any challenges they overcame. Cross-reference with `git shortlog -sn` and merged Pull Requests.

### cagonzal
- **Implemented:** Game engine (turns, combat, victory logic), shared rules system, game-state synchronization
- **Modules owned:** Gaming — Web-based game; Gaming — Remote players; Gaming — Multiplayer (3+)
- **Challenges & lessons:** Synchronizing game state across multiple clients in real-time; implementing fair dice-based combat resolution; handling 4-player concurrent match logic

### fraalmei
- **Implemented:** Database ORM
- **Modules owned:**  Web — Use an ORM 
- **Challenges & lessons:** Understanding and deploying an object-relational mapping using Prisma for interacting with the database.

### jrollon-
- **Implemented:** _TODO_
- **Modules owned:** _TODO_
- **Challenges & lessons:** _TODO_

### samartin
- **Implemented:** https functionality
- **Modules owned:** none
- **Challenges & lessons:** Coordinating the team, reviewing the product, testing use cases, documenting.

### dyunta
- **Implemented:** _TODO_
- **Modules owned:** _TODO_
- **Challenges & lessons:** _TODO_

---

## Known limitations

> **TODO (team):** list any feature or module that is partially implemented, any browser-specific issue, performance caveat, or planned future work.

---

## License

> **TODO (team):** choose a license (MIT recommended for school projects) or state that the repository is for educational use only.