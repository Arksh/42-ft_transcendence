import { FACTIONS, NEUTRAL_TERRITORIES } from '../src/game/Factions.js';
import { createScaledTerritories } from '../src/game/Territories.js';
import { checkCapitalVictory, getScoreWinner } from '../src/game/Victory.js';
import TurnManager from '../src/game/TurnManager.js';
import Player from '../src/game/Player.js';

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 700;
const TERRITORIES = createScaledTerritories(CANVAS_WIDTH, CANVAS_HEIGHT);

export default class Gamestate {
  constructor(players, maxTurns = 100) {
    this.players = players;
    this.maxTurns = maxTurns;
    this.turn = 1;
    this.tm = new TurnManager(players);
    this.phase = this.tm.phase ?? TurnManager.PHASES.REINFORCE;
    this.winner = null;
    this.activeFactions = players.map((p) => p.faction);
    this.territoryOwners = this._initTerritoryOwners();
    this.troopCount = this._initTroopCount();
    this.currentPlayer = this.tm.getCurrentPlayer();
    this.reinforcementsLeft = this._calculateReinforcements(this.currentPlayer.faction);
    this.territoriesAttackedThisTurn = new Set();
  }

  _initTerritoryOwners() {
    const owners = {};
    Object.entries(FACTIONS).forEach(([factionId, faction]) => {
      faction.territories.forEach((id) => {
        owners[id] = factionId;
      });
    });
    NEUTRAL_TERRITORIES.forEach((id) => {
      owners[id] = null;
    });
    return owners;
  }

  _initTroopCount() {
    const counts = {};
    Object.keys(TERRITORIES)
      .filter((id) => !TERRITORIES[id].impassable)
      .forEach((id) => {
        counts[id] = TERRITORIES[id].isRegCapital ? 3 : 2;
      });
    return counts;
  }

  _calculateReinforcements(factionId) {
    const owned = Object.entries(this.territoryOwners)
      .filter(([, owner]) => owner === factionId)
      .map(([id]) => id);
    return Math.max(3, Math.floor(owned.length / 3));
  }

  serialize() {
    return {
      currentPlayer: this.currentPlayer,
      phase: this.phase,
      turn: this.turn,
      winner: this.winner,
      territoryOwners: this.territoryOwners,
      troopCount: this.troopCount,
      reinforcementsLeft: this.reinforcementsLeft,
      activeFactions: this.activeFactions,
    };
  }

  reinforce(territoryId) {
    if (this.phase !== TurnManager.PHASES.REINFORCE)
      return { ok: false, error: 'Not in reinforcement phase' };
    if (this.territoryOwners[territoryId] !== this.currentPlayer.faction)
      return { ok: false, error: 'Can only reinforce owned territories' };
    if (this.reinforcementsLeft <= 0) return { ok: false, error: 'No reinforcements left' };

    this.troopCount[territoryId]++;
    this.reinforcementsLeft--;
    return { ok: true, state: this.serialize() };
  }

  attack(attackFrom, attackTo, attackTroops) {
    if (this.phase !== TurnManager.PHASES.ATTACK)
      return { ok: false, error: 'Not in attack phase' };
    if (this.territoryOwners[attackFrom] !== this.currentPlayer.faction)
      return { ok: false, error: 'Not your territory' };
    if (this.territoryOwners[attackTo] === this.currentPlayer.faction)
      return { ok: false, error: 'Cannot attack own territories' };
    if (!TERRITORIES[attackFrom].neighbors.includes(attackTo))
      return { ok: false, error: 'Can only attack neighboring territories' };
    if (this.troopCount[attackFrom] <= 1)
      return { ok: false, error: 'Not enough troops to attack' };
    if (this.territoriesAttackedThisTurn.has(attackFrom))
      return { ok: false, error: 'Territory has already attacked this turn' };

    const defenderTroops = Math.min(3, this.troopCount[attackTo]);
    const { attackerLosses, defenderLosses, attackDice, defenseDice, troopBonus } =
      TurnManager.resolveCombat(attackTroops, defenderTroops);

    this.troopCount[attackFrom] -= attackerLosses;
    this.troopCount[attackTo] -= defenderLosses;

    let conquered = false;
    if (this.troopCount[attackTo] <= 0) {
      const survivors = attackTroops - attackerLosses;
      this.troopCount[attackTo] = survivors;
      this.troopCount[attackFrom] -= survivors;
      this.territoryOwners[attackTo] = this.currentPlayer.faction;
      conquered = true;
    }

    this.territoriesAttackedThisTurn.add(attackFrom);

    return {
      ok: true,
      battleReport: {
        attackFrom,
        attackTo,
        attackerTroops: attackTroops,
        defenderTroops,
        attackDice,
        defenseDice,
        attackerLosses,
        defenderLosses,
        troopBonus,
        conquered,
      },
      state: this.serialize(),
    };
  }

  fortify(fortifyFrom, fortifyTo, troops) {
    if (this.phase !== TurnManager.PHASES.FORTIFY)
      return { ok: false, error: 'Not in fortification phase' };
    if (this.territoryOwners[fortifyFrom] !== this.currentPlayer.faction)
      return { ok: false, error: 'Not your territory' };
    if (this.territoryOwners[fortifyTo] !== this.currentPlayer.faction)
      return { ok: false, error: 'Can only fortify between owned territories' };
    if (!TERRITORIES[fortifyFrom].neighbors.includes(fortifyTo))
      return { ok: false, error: 'Can only fortify neighboring territories' };
    if (this.troopCount[fortifyFrom] - troops < 1)
      return { ok: false, error: 'Not enough troops to fortify' };

    this.troopCount[fortifyFrom] -= troops;
    this.troopCount[fortifyTo] += troops;

    return { ok: true, state: this.serialize() };
  }

  async nextTurn() {
    if (this.winner) return { ok: false, error: 'Game already ended' };

    console.log('ANTES - phase GameState:', this.phase);
    console.log('ANTES - phase TurnManager:', this.tm.phase);
    await this.tm.nextTurn();
    console.log('DESPUÉS - phase TurnManager:', this.tm.phase);
    this.currentPlayer = this.tm.getCurrentPlayer();
    const previousPhase = this.phase;
    this.phase = this.tm.phase;
    this.territoriesAttackedThisTurn = new Set();

    if (this.phase === TurnManager.PHASES.REINFORCE) {
      this.turn++;
      this.reinforcementsLeft = this._calculateReinforcements(this.currentPlayer.faction);

      const capitalWinner = this.activeFactions.find((fId) =>
        checkCapitalVictory(fId, this.territoryOwners, this.activeFactions)
      );
      if (capitalWinner) {
        this.winner = { factionId: capitalWinner, reason: 'capitals' };
      } else if (this.turn > this.maxTurns) {
        const scoreWinner = getScoreWinner(this.territoryOwners, this.activeFactions);
        this.winner = { factionId: scoreWinner, reason: 'score' };
      }
    }

    return { ok: true, state: this.serialize() };
  }
}
