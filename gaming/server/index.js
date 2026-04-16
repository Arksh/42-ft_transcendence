import express from 'express';
import cors from 'cors';
import Gamestate from './GameState.js';
import Player from '../src/game/Player.js';
import { FACTIONS } from '../src/game/Factions.js';
import { getPlayer, saveMatchResult, unlockAchievement } from './services/PlayerService.js';


const app = express();
app.use(cors());
app.use(express.json());

let gameState = null;

app.post('/game/start', (req, res) => {
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

    gameState = new Gamestate(players);
    res.json({ ok: true, state: gameState.serialize() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/game/state', (req, res) => {
  try {
    if (!gameState) {
      const players = ['france', 'spain', 'england'].map((factionId, index) => {
        const faction = FACTIONS[factionId];
        if (!faction) throw new Error(`Faction ${factionId} not found`);
        return new Player({
          id: `player-${index + 1}`,
          name: faction.name,
          faction: factionId,
          color: faction.color,
        });
      });
      gameState = new Gamestate(players);
    }
    res.json({ ok: true, state: gameState.serialize() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/game/reinforce', (req, res) => {
  if (!gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const { territoryId } = req.body;
  res.json(gameState.reinforce(territoryId));
});

app.post('/game/attack', (req, res) => {
  if (!gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const { attackFrom, attackTo, attackTroops } = req.body;
  res.json(gameState.attack(attackFrom, attackTo, attackTroops));
});

app.post('/game/fortify', (req, res) => {
  if (!gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  const { fortifyFrom, fortifyTo, troops } = req.body;
  res.json(gameState.fortify(fortifyFrom, fortifyTo, troops));
});

app.post('/game/next-turn', async (req, res) => {
  if (!gameState) return res.status(404).json({ ok: false, error: 'No game in progress' });
  res.json(await gameState.nextTurn());
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Great Risk server running on http://localhost:${PORT}`);
});

// Obtener datos de un jugador
app.get('/players/:id', async (req, res) => {
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