/**
 * PlayerService — mediator between gaming server and backend API.
 * Currently uses mock data. Replace API calls when backend is ready.
 */

const BACKEND_URL = process.env.BACKEND_URL || null;

// ========== MOCK DATA ==========
const mockPlayers = {
	'player-1': {
		id: 'player-1',
		name: 'Player 1',
		achievements: [],
		stats: { gamesPlayed: 0, gamesWon: 0, territoriesConquered: 0, totalTurns: 0 },
		matchHistory: [],
	},
	'player-2': {
		id: 'player-2',
		name: 'Player 2',
		achievements: [],
		stats: { gamesPlayed: 0, gamesWon: 0, territoriesConquered: 0, totalTurns: 0 },
		matchHistory: [],
	},
	'player-3': {
		id: 'player-3',
		name: 'Player 3',
		achievements: [],
		stats: { gamesPlayed: 0, gamesWon: 0, territoriesConquered: 0, totalTurns: 0 },
		matchHistory: [],
	},
}

// ========== SERVICE METHODS ==========
/**
 * Get player data by id.
 * @param {string} playerId
 */
async function getPlayer(playerId) {
  if (BACKEND_URL) {
    const res = await fetch(`${BACKEND_URL}/users/${playerId}`);
    return res.json();
  }
  return mockPlayers[playerId] ?? null;
}

/**
 * Save match result for all players.
 * @param {Object} matchData
 */
async function saveMatchResult(matchData) {
  if (BACKEND_URL) {
    await fetch(`${BACKEND_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData),
    });
    return;
  }
  // Mock: just log it
  console.log('Match result (mock):', matchData);
}

/**
 * Unlock an achievement for a player.
 * @param {string} playerId
 * @param {string} achievementId
 */
async function unlockAchievement(playerId, achievementId) {
  if (BACKEND_URL) {
    await fetch(`${BACKEND_URL}/users/${playerId}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId }),
    });
    return;
  }
  // Mock: add to local data
  if (mockPlayers[playerId]) {
    if (!mockPlayers[playerId].achievements.includes(achievementId)) {
      mockPlayers[playerId].achievements.push(achievementId);
      console.log(`Achievement unlocked (mock): ${achievementId} for ${playerId}`);
    }
  }
}

export { getPlayer, saveMatchResult, unlockAchievement };