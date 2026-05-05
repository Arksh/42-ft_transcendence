import { Router } from 'express';
import Player from '@trascendence/shared/Player';
import { FACTIONS } from '@trascendence/shared/Factions';
import Gamestate from '../gameState.js';

// Issue #4 requirement: 403 when it isn't this player's turn.
// Body must carry `playerId`; auth-resolved identity will replace this once
// the Auth Service lands.
function ensureTurn(room, playerId) {
  if (!playerId) return { ok: false, code: 400, error: 'playerId required' };
  if (room.gameState.currentPlayer.id !== playerId)
    return { ok: false, code: 403, error: 'Not your turn' };
  return { ok: true };
}

export function createGamesRouter({ db, publisher }) {
  const router = Router();

  router.post('/rooms/:roomId/game/start', async (req, res) => {
    const room = await db.getRoom(req.params.roomId);
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
      await db.saveRoom(req.params.roomId, room);
      res.json({ ok: true, state: room.gameState.serialize() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get('/rooms/:roomId/game/state', async (req, res) => {
    const room = await db.getRoom(req.params.roomId);
    if (!room?.gameState)
      return res.status(404).json({ ok: false, error: 'No game in progress' });
    res.json({ ok: true, state: room.gameState.serialize() });
  });

  router.post('/rooms/:roomId/game/reinforce', async (req, res) => {
    const room = await db.getRoom(req.params.roomId);
    if (!room?.gameState)
      return res.status(404).json({ ok: false, error: 'No game in progress' });

    const { playerId, territoryId } = req.body;
    const turn = ensureTurn(room, playerId);
    if (!turn.ok) return res.status(turn.code).json({ ok: false, error: turn.error });

    const result = room.gameState.reinforce(territoryId);
    if (result.ok) {
      await db.saveRoom(req.params.roomId, room);
      publisher.publishState(req.params.roomId, room.gameState);
    }
    res.json(result);
  });

  router.post('/rooms/:roomId/game/attack', async (req, res) => {
    const room = await db.getRoom(req.params.roomId);
    if (!room?.gameState)
      return res.status(404).json({ ok: false, error: 'No game in progress' });

    const { playerId, attackFrom, attackTo, attackTroops } = req.body;
    const turn = ensureTurn(room, playerId);
    if (!turn.ok) return res.status(turn.code).json({ ok: false, error: turn.error });

    const result = room.gameState.attack(attackFrom, attackTo, attackTroops);
    if (result.ok) {
      await db.saveRoom(req.params.roomId, room);
      publisher.publishState(req.params.roomId, room.gameState);
    }
    res.json(result);
  });

  router.post('/rooms/:roomId/game/fortify', async (req, res) => {
    const room = await db.getRoom(req.params.roomId);
    if (!room?.gameState)
      return res.status(404).json({ ok: false, error: 'No game in progress' });

    const { playerId, fortifyFrom, fortifyTo, troops } = req.body;
    const turn = ensureTurn(room, playerId);
    if (!turn.ok) return res.status(turn.code).json({ ok: false, error: turn.error });

    const result = room.gameState.fortify(fortifyFrom, fortifyTo, troops);
    if (result.ok) {
      await db.saveRoom(req.params.roomId, room);
      publisher.publishState(req.params.roomId, room.gameState);
    }
    res.json(result);
  });

  router.post('/rooms/:roomId/game/next-turn', async (req, res) => {
    const room = await db.getRoom(req.params.roomId);
    if (!room?.gameState)
      return res.status(404).json({ ok: false, error: 'No game in progress' });

    const { playerId } = req.body;
    const turn = ensureTurn(room, playerId);
    if (!turn.ok) return res.status(turn.code).json({ ok: false, error: turn.error });

    const result = await room.gameState.nextTurn();
    if (result.ok) {
      await db.saveRoom(req.params.roomId, room);
      publisher.publishState(req.params.roomId, room.gameState);
    }
    res.json(result);
  });

  return router;
}
