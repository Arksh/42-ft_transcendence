import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import Gamestate from './GameState.js';
import Player from '../src/game/Player.js';
import { FACTIONS } from '../src/game/Factions.js';
import { getPlayer, saveMatchResult, unlockAchievement } from './services/PlayerService.js';


const app = express();
app.use(cors());
app.use(express.json());

const rooms = new Map();

function getRoom(roomId) {
	return rooms.get(roomId) ?? null;
}

const REDIS_URL = process.env.REDIS_URL ?? null;
const redisPub = REDIS_URL
  ? new Redis(REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: false })
  : null;
if (redisPub) {
  redisPub.on('connect', () => console.log(`[redis] publisher connected to ${REDIS_URL}`));
  redisPub.on('error', (err) => console.error('[redis] publisher error:', err.message));
} else {
  console.warn('[redis] REDIS_URL not set — game state will not be broadcast');
}

function publishState(roomId, room) {
  if (!redisPub || !room?.gameState) return;
  try {
    redisPub.publish(`game:${roomId}:state`, JSON.stringify(room.gameState.serialize()));
  } catch (err) {
    console.error(`[redis] publish failed for room=${roomId}:`, err.message);
  }
}

app.post('/rooms', (req, res) => {
	const { roomId, maxPlayers } = req.body;
	if (rooms.has(roomId))
    return res.status(409).json({ ok: false, error: 'Room already exists' });
  if (!roomId || roomId.trim() === '')
    return res.status(400).json({ ok: false, error: 'Invalid room name' });

  rooms.set(roomId, {
	maxPlayers,
	players: [],
	gameState: null,
	started: false,
  });

  res.json({ ok:true, roomId })
});

app.post('/rooms/:roomId/join', (req, res) => {
	const room = getRoom(req.params.roomId);
	if (!room) return res.status(404).json({ ok: false, error: 'Room not found' });
  if (room.started) return res.status(400).json({ ok: false, error: 'Game already started' });
  if (room.players.length >= room.maxPlayers)
    return res.status(400).json({ ok: false, error: 'Room is full' });

	const { playerId, playerName, faction } = req.body;

	if (room.players.some(p => p.faction === faction))
    return res.status(400).json({ ok: false, error: 'Faction already taken' });
  if (room.players.some(p => p.id === playerId))
    return res.status(400).json({ ok: false, error: 'Already in room' });

	room.players.push(new Player({ id: playerId, name: playerName, faction, color: FACTIONS[faction].color }));
  res.json({ ok: true, room: { players: room.players, maxPlayers: room.maxPlayers, started: room.started } });
});

// Estado de la sala
app.get('/rooms/:roomId', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ ok: false, error: 'Room not found' });
  res.json({ ok: true, room: { players: room.players, maxPlayers: room.maxPlayers, started: room.started } });
});

// Iniciar partida
app.post('/rooms/:roomId/start', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ ok: false, error: 'Room not found' });
  if (room.players.length < 2) return res.status(400).json({ ok: false, error: 'Not enough players' });
  if (room.started) return res.status(400).json({ ok: false, error: 'Already started' });

  room.gameState = new Gamestate(room.players);
  room.started = true;
  publishState(req.params.roomId, room);
  res.json({ ok: true, state: room.gameState.serialize() });
});

app.post('/rooms/:roomId/game/start', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ ok: false, error: 'Room not found' });
  try {
    const { factions } = req.body;
    const factionIds = factions || ['france', 'spain', 'england'];
    const players = factionIds.map((factionId, index) => {
      const faction = FACTIONS[factionId];
      if (!faction) throw new Error(`Faction ${factionId} not found`);
      return new Player({
        id: `player-${index + 1}`,
        name: faction.name,
        faction: factionId,
        color: faction.color,
      });
    });

    room.gameState = new Gamestate(players);
    res.json({ ok: true, state: room.gameState.serialize() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/rooms/:roomId/game/state', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room?.gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  res.json({ ok: true, state: room.gameState.serialize() });
});

app.post('/rooms/:roomId/game/reinforce', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room?.gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const { territoryId } = req.body;
  const result = room.gameState.reinforce(territoryId);
  if (result.ok) publishState(req.params.roomId, room);
  res.json(result);
});

app.post('/rooms/:roomId/game/attack', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room?.gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const { attackFrom, attackTo, attackTroops } = req.body;
  const result = room.gameState.attack(attackFrom, attackTo, attackTroops);
  if (result.ok) publishState(req.params.roomId, room);
  res.json(result);
});

app.post('/rooms/:roomId/game/fortify', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room?.gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const { fortifyFrom, fortifyTo, troops } = req.body;
  const result = room.gameState.fortify(fortifyFrom, fortifyTo, troops);
  if (result.ok) publishState(req.params.roomId, room);
  res.json(result);
});

app.post('/rooms/:roomId/game/next-turn', async (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room?.gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const result = await room.gameState.nextTurn();
  if (result.ok) publishState(req.params.roomId, room);
  res.json(result);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Great Risk server running on http://localhost:${PORT}`);
});

// Obtener datos de un jugador
app.get('/rooms/:roomId/players/:id', async (req, res) => {
  const player = await getPlayer(req.params.id);
  if (!player) return res.status(404).json({ ok: false, error: 'Player not found' });
  res.json({ ok: true, player });
});

// Guardar resultado de partida — se llama cuando hay ganador
app.post('/matches', async (req, res) => {
  await saveMatchResult(req.body);
  res.json({ ok: true });
});

// Desbloquear logro
app.post('/players/:id/achievements', async (req, res) => {
  await unlockAchievement(req.params.id, req.body.achievementId);
  res.json({ ok: true });
});