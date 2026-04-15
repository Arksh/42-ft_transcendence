const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}

export const api = {
  startGame: (factions) => request('POST', '/game/start', { factions }),
  getState: () => request('GET', '/game/state'),
  reinforce: (territoryId) => request('POST', '/game/reinforce', { territoryId }),
  attack: (attackFrom, attackTo, attackTroops) =>
    request('POST', '/game/attack', { attackFrom, attackTo, attackTroops }),
  fortify: (fortifyFrom, fortifyTo, troops) =>
    request('POST', '/game/fortify', { fortifyFrom, fortifyTo, troops }),
  nextTurn: () => request('POST', '/game/next-turn'),
};
