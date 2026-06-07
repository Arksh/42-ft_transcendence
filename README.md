*This project has been created as part of the 42 curriculum by cagonzal, fraalmei, jrollon-, samartin, and dyunta.*

# Great Risk — ft_transcendence

## Description

**Great Risk** is a turn-based multiplayer strategy game inspired by the classic board game *Risk*, set in a stylised map of Europe. Players take control of one of six historical factions and compete for territorial dominance through reinforcement, attack, and fortification phases. The web application is built as a real-time, multi-user platform with persistent accounts, match history, achievements, and in-game chat.

This project is our team's submission for the 42 `ft_transcendence` final project of the Common Core.

### Key features

- **Real-time multiplayer strategy game** — up to 6 players per match, 45 territories across Europe, turn-based phases (Reinforce → Attack → Fortify).
- **Dice-based combat** — classic Risk-style attacker/defender dice resolution.
- **Win conditions** — capital conquest, total domination, or score-based victory at the 100-turn cap.
- **6 playable factions** — France, Spain, England, Austria, Russia, and the Ottomans.
- **Persistent user accounts** — registration, login, profile, avatar, friend list.
- **Match history & statistics** — wins, losses, ELO ranking, games played.
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

The project reads configuration from a `.env` file at the repository root. This file is **not** committed to Git. A reference template is provided as `.env.example` — copy it and adjust values for your environment:

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

> **TODO (team):** if any additional secrets are added (OAuth client IDs, JWT secret, etc.), document them here and in `.env.example`.

### Running the project

The entire stack runs with a single command:

```bash
make up
```

This builds and starts the following containers in detached mode:

- `client` — React frontend served by Nginx on **http://localhost:80**
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

Once the stack is up, open **http://localhost** in Google Chrome (the project targets the latest stable Chrome per the subject).

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

> **TODO (team):** if specific tools or workflows were used (e.g., GitHub Copilot, Claude Code, ChatGPT), name them and clarify which parts of the project each was used on.

---

## Team Information

> **TODO (team):** confirm the role assignments below. The subject (Chapter II) requires PO, PM/Scrum Master, Tech Lead/Architect, and Developers. With 5 members each role can be dedicated.

| Member       | Role(s)                                  | Responsibilities                                        |
| ------------ | ---------------------------------------- | ------------------------------------------------------- |
| **cagonzal** | _TODO_                                   | _TODO_                                                  |
| **fraalmei** | _TODO_                                   | _TODO_                                                  |
| **jrollon-** | _TODO_                                   | _TODO_                                                  |
| **samartin** | _TODO_                                   | _TODO_                                                  |
| **dyunta**   | _TODO_                                   | _TODO_                                                  |

---

## Project Management

> **TODO (team):** fill in tools and meeting cadence actually used.

- **Task organization:** _TODO — e.g., GitHub Issues + Projects board, Trello, etc._
- **Code review:** Pull Request based, reviewed by at least one other team member before merging to `main`.
- **Meetings:** _TODO — weekly / bi-weekly sync._
- **Communication channels:** _TODO — Discord / Slack / WhatsApp._
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

> **TODO (team):** fill in the *Contributor(s)* column.

| Feature                          | Description                                                                                        | Contributor(s) |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | -------------- |
| Authentication                   | Email + password registration and login with scrypt-hashed credentials                             | _TODO_         |
| Lobby                            | Create or join game rooms, pick a faction, see other players                                       | _TODO_         |
| Game board                       | Canvas-based map of Europe, 45 territories, faction control                                        | _TODO_         |
| Turn engine                      | Reinforce / Attack / Fortify phases, 100-turn cap                                                  | _TODO_         |
| Dice combat                      | Risk-style attacker vs defender dice rolls and territory transfers                                 | _TODO_         |
| Victory conditions               | Capital conquest, full elimination, score-based win at turn cap                                    | _TODO_         |
| Real-time sync                   | WebSocket + Redis pub/sub to broadcast game-state updates                                          | _TODO_         |
| In-match chat                    | Real-time text messages between players in the same match                                          | _TODO_         |
| Friends                          | Add / remove friends, see friend list                                                              | _TODO_         |
| Match history                    | Past matches per user, with results                                                                | _TODO_         |
| Stats & ELO                      | Wins / losses / games played / ELO ranking per user                                                | _TODO_         |
| Achievements                     | Unlockable achievements with in-game notifications                                                 | _TODO_         |
| Avatar upload                    | Custom avatar with default fallback                                                                | _TODO_         |
| Privacy Policy / Terms of Service| Dedicated pages, linked from a footer that is persistent across **every** view                    | _TODO_         |
| Multi-user concurrency           | Multiple users logged in simultaneously, concurrent matches, real-time state propagation           | _TODO_         |

---

## Modules

> **TODO (team):** confirm which modules the team is officially claiming and fill in the contributor column. The list below reflects what is **implemented in the codebase** and is a candidate set adding up to 14 points. Adjust before evaluation.

| Module                                            | Type   | Points | Justification                                                                       | Contributor(s) |
| ------------------------------------------------- | ------ | :----: | ----------------------------------------------------------------------------------- | -------------- |
| Web — Use a frontend framework (React)            | Minor  |   1    | React 19 + Vite SPA                                                                 | _TODO_         |
| Web — Use a backend framework (Express)           | Minor  |   1    | Two Express services (`engine`, `database`)                                         | _TODO_         |
| Web — Real-time features (WebSockets)             | Major  |   2    | `ws` + Redis pub/sub power live game-state sync and chat                            | _TODO_         |
| Web — Use an ORM                                  | Minor  |   1    | Prisma ORM with migrations on PostgreSQL                                            | _TODO_         |
| User Management — Standard user management & auth | Major  |   2    | Register, login, profile, avatar, friend list with online status                    | _TODO_         |
| User Management — Game stats & match history      | Minor  |   1    | `Stat` and `Match`/`MatchPlayer` models; per-user wins/losses/ELO                   | _TODO_         |
| Gaming — Web-based game (Great Risk)              | Major  |   2    | Original turn-based strategy game with clear rules and win conditions               | _TODO_         |
| Gaming — Remote players                           | Major  |   2    | Two or more players on separate machines play the same match in real time          | _TODO_         |
| Gaming — Multiplayer (3+)                         | Major  |   2    | Up to 6 players per match, synchronised across all clients                          | _TODO_         |
| Gaming and UX — Gamification (achievements)       | Minor  |   1    | Persistent achievement system with in-game notifications                            | _TODO_         |
| User interaction — Basic chat in game             | _part of User Management Major above, or separate Major if claimed standalone_ | _TODO — clarify which Major covers chat/profile/friends_ | _TODO_         |

**Candidate total: ~ 14 points** (adjust as needed; the subject recommends aiming above 14 to cover any module that fails review).

> **Modules of choice / custom modules:** _TODO — if any custom module is claimed, provide the dedicated justification block (why chosen, technical challenges addressed, value added, why it deserves Major status)._

---

## Individual Contributions

> **TODO (team):** fill in each member's detailed contributions, the modules and features they led, and any challenges they overcame. Cross-reference with `git shortlog -sn` and merged Pull Requests.

### cagonzal
- **Implemented:** _TODO_
- **Modules owned:** _TODO_
- **Challenges & lessons:** _TODO_

### fraalmei
- **Implemented:** _TODO_
- **Modules owned:** _TODO_
- **Challenges & lessons:** _TODO_

### jrollon-
- **Implemented:** _TODO_
- **Modules owned:** _TODO_
- **Challenges & lessons:** _TODO_

### samartin
- **Implemented:** _TODO_
- **Modules owned:** _TODO_
- **Challenges & lessons:** _TODO_

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
