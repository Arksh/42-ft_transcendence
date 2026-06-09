import { useState, useEffect } from 'react';
import { FACTIONS } from '@trascendence/shared/Factions';
import { api } from '../api.js';

const baseBtn =
  'w-full cursor-pointer rounded border-0 p-2.5 text-center font-mono text-[13px] font-bold text-white';
const inputClass =
  'box-border w-full rounded border-2 border-[#555] bg-[#333] p-2.5 font-mono text-[13px] text-white';
const labelClass = 'mb-2 block text-[#FFD700]';

const BG_CLASSES = {
  '#FF6B6B': 'bg-[#FF6B6B]',
  '#6496FF': 'bg-[#6496FF]',
  '#333': 'bg-[#333]',
};

export default function Lobby({ onStart, initialPlayerId, onLogout }) {
  const [screen, setScreen] = useState('home');
  const [roomId, setRoomId] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [faction, setFaction] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const playerId = initialPlayerId;

  useEffect(() => {
    if (screen !== 'faction' || !roomId) return;

    const interval = setInterval(async () => {
      const res = await api.getRoom(roomId);
      if (!res.ok) return;
      setRoomData(res.room);
      if (res.room.started && faction) {
        clearInterval(interval);
        onStart({ roomId, playerId, faction });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [screen, roomId, faction, onStart, playerId]);

  async function handleCreateRoom() {
    if (!roomInput.trim()) return;
    const res = await api.createRoom(roomInput.trim(), maxPlayers);
    if (!res.ok) { setError(res.error); return; }
    setRoomId(roomInput.trim());
    setIsCreator(true);
    setScreen('faction');
    setError(null);
  }

  async function handleJoinRoom() {
    if (!roomInput.trim()) return;
    const res = await api.getRoom(roomInput.trim());
    if (!res.ok) { setError(res.error); return; }

    const playersInRoom = res.room.players;
    const existingPlayer = playersInRoom.find(p => p.id === initialPlayerId);

    if (res.room.started && !existingPlayer) {
      setError('Game already started and you are not in the player list.');
      return;
    }

    setRoomId(roomInput.trim());
    setRoomData(res.room);

    if (playersInRoom[0]?.id === initialPlayerId) {
      setIsCreator(true);
    } else {
      setIsCreator(false);
    }

    setScreen('faction');
    setError(null);

    if (existingPlayer?.faction) {
      setFaction(existingPlayer.faction);
    }
  }

  async function handleSelectFaction(factionId) {
    const res = await api.joinRoom(roomId, initialPlayerId, FACTIONS[factionId].name, factionId);
    if (!res.ok) { setError(res.error); return; }
    setFaction(factionId);
    setRoomData(res.room);
    setError(null);
  }

  async function handleStart() {
    const res = await api.startRoom(roomId);
    if (!res.ok) { setError(res.error); return; }
    onStart({ roomId, playerId: initialPlayerId, faction });
  }

  const takenFactions = roomData?.players?.map(p => p.faction) ?? [];
  const allPlayersJoined = roomData && roomData.players.length === roomData.maxPlayers;

  return (
    <div className="relative mx-auto my-4 max-h-[92vh] max-w-[600px] overflow-y-auto rounded-xl border-2 border-[#FF6B6B] bg-[#1a1a2e] p-5 font-mono text-white shadow-[0_0_30px_rgba(255,107,107,0.3)] sm:my-[60px] sm:p-10">
      <button
        onClick={onLogout}
        className="absolute top-3 right-3 cursor-pointer rounded border border-[#FF6B6B] bg-transparent px-2 py-1 text-[11px] font-bold text-[#FF6B6B] sm:top-4 sm:right-4"
      >
        Logout
      </button>
      <h1 className="mb-1 text-center text-2xl tracking-[2px] text-[#FF6B6B] sm:text-4xl">GREAT RISK</h1>
      <p className="mb-4 text-center text-sm text-[#aaa] sm:mb-8 sm:text-base">Napoleonic Wars</p>

      {error && (
        <div className="mb-4 whitespace-pre-wrap rounded border border-[#FF6B6B] bg-[rgba(255,107,107,0.2)] p-2.5 text-xs text-[#FF6B6B]">
          {error}
        </div>
      )}

      {screen === 'home' && (
        <div className="flex gap-3">
          <button onClick={() => setScreen('create')} className={`${baseBtn} ${BG_CLASSES['#FF6B6B']}`}>
            Create Room
          </button>
          <button onClick={() => setScreen('join')} className={`${baseBtn} ${BG_CLASSES['#6496FF']}`}>
            Join Room
          </button>
        </div>
      )}

      {screen === 'create' && (
        <div>
          <label className={labelClass}>Room Name</label>
          <input
            value={roomInput}
            onChange={e => setRoomInput(e.target.value.toLowerCase().replace(/[^a-z0-0-]/g, ''))}
            placeholder="e.g. waterloo-1815"
            maxLength={15}
            className={inputClass}
          />
          <label className={`${labelClass} mt-4`}>Players</label>
          <div className="mb-5 flex gap-2">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setMaxPlayers(n)}
                className={`${baseBtn} ${maxPlayers === n ? BG_CLASSES['#FF6B6B'] : BG_CLASSES['#333']}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button onClick={handleCreateRoom} className={`${baseBtn} ${BG_CLASSES['#FF6B6B']}`}>Create</button>
          <button onClick={() => setScreen('home')} className={`${baseBtn} ${BG_CLASSES['#333']} mt-2`}>Back</button>
        </div>
      )}

      {screen === 'join' && (
        <div>
          <label className={labelClass}>Room Name</label>
          <input
            value={roomInput}
            onChange={e => setRoomInput(e.target.value.toLowerCase().replace(/[^a-z0-0-]/g, ''))}
            placeholder="Enter room name"
            maxLength={15}
            className={inputClass}
          />
          {error?.includes("Choose other login") ? (
            <button onClick={onLogout} className={`${baseBtn} ${BG_CLASSES['#FF6B6B']} mt-4`}>
              OK / Back to Login
            </button>
          ) : (
            <>
              <button onClick={handleJoinRoom} className={`${baseBtn} ${BG_CLASSES['#6496FF']} mt-4`}>Join</button>
              <button onClick={() => setScreen('home')} className={`${baseBtn} ${BG_CLASSES['#333']} mt-2`}>Back</button>
            </>
          )}
        </div>
      )}

      {screen === 'faction' && (
        <div>
          <div className="mb-4 text-xs text-[#aaa]">
            Room: <span className="text-[#FFD700]">{roomId}</span>
            {' '}— {roomData?.players?.length ?? 0}/{roomData?.maxPlayers ?? maxPlayers} players
          </div>

          {!faction ? (
            <>
              <label className={`${labelClass} mb-3`}>Choose your faction</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FACTIONS).map(([factionId, f]) => {
                  const taken = takenFactions.includes(factionId);
                  return (
                    <button
                      key={factionId}
                      onClick={() => !taken && handleSelectFaction(factionId)}
                      className={`rounded border-2 border-[#555] px-3.5 py-2 font-mono text-xs ${
                        taken
                          ? 'cursor-not-allowed bg-[#1a1a1a] text-[#444] opacity-40'
                          : 'cursor-pointer bg-[#333] text-white'
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mb-4 text-[#4CAF50]">
              ✓ Playing as <strong>{FACTIONS[faction].name}</strong>
            </div>
          )}

          {roomData?.players?.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] text-[#aaa]">IN ROOM:</div>
              {roomData.players.map(p => (
                <div key={p.id} className="mb-1 text-xs text-[#E0E0E0]">
                  • {p.name} —{' '}
                  <span style={{ color: FACTIONS[p.faction]?.color }}>
                    {FACTIONS[p.faction]?.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isCreator && faction && allPlayersJoined && (
            <button onClick={handleStart} className={`${baseBtn} ${BG_CLASSES['#FF6B6B']} mt-5`}>
              Start Campaign
            </button>
          )}

          {isCreator && faction && !allPlayersJoined && (
            <div className="mt-4 text-xs text-[#aaa]">
              Waiting for {(roomData?.maxPlayers ?? maxPlayers) - (roomData?.players?.length ?? 0)} more player(s)...
            </div>
          )}

          {!isCreator && faction && (
            <div className="mt-4 text-xs text-[#aaa]">
              Waiting for host to start...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
