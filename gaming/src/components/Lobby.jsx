import { useState } from 'react';
import { FACTIONS } from '../game/Factions';
import { api } from '../api';

export default function Lobby({ onStart }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [selections, setSelections] = useState({});

  const factionKeys = Object.keys(FACTIONS);

  function handleFactionSelect(playerIndex, factionId) {
    setSelections((prev) => ({ ...prev, [playerIndex]: factionId }));
  }

  async function handleStart() {
    for (let i = 0; i < playerCount; i++) {
      if (!selections[i]) return;
    }

    const chosen = Object.values(selections).slice(0, playerCount);
    if (new Set(chosen).size !== playerCount) return;

    const factions = Array.from({ length: playerCount }, (_, i) => selections[i]);
    const res = await api.startGame(factions);
    if (res.ok) onStart();
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '60px auto',
        fontFamily: 'monospace',
        color: 'white',
        backgroundColor: '#1a1a2e',
        padding: '40px',
        borderRadius: '12px',
        border: '2px solid #FF6B6B',
        boxShadow: '0 0 30px rgba(255, 107, 107, 0.3)',
      }}
    >
      <h1
        style={{ textAlign: 'center', color: '#FF6B6B', marginBottom: '4px', letterSpacing: '2px' }}
      >
        GREAT RISK
      </h1>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '32px' }}>Napoleonic Wars</p>

      {/* Number of Players */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700' }}>
          Number of Players
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setPlayerCount(n)}
              style={{
                padding: '8px 20px',
                backgroundColor: playerCount === n ? '#FF6B6B' : '#333',
                color: 'white',
                border: playerCount === n ? '2px solid #FF6B6B' : '2px solid #555',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Faction Selection */}
      {Array.from({ length: playerCount }, (_, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>
            Player {i + 1}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {factionKeys.map((factionId) => {
              const faction = FACTIONS[factionId];
              const takenByOther = Object.entries(selections).some(
                ([idx, fId]) => Number(idx) !== i && fId === factionId
              );
              const selected = selections[i] === factionId;

              return (
                <button
                  key={factionId}
                  onClick={() => !takenByOther && handleFactionSelect(i, factionId)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: selected ? faction.color : takenByOther ? '#1a1a1a' : '#333',
                    color: takenByOther ? '#444' : 'white',
                    border: selected ? `2px solid ${faction.color}` : '2px solid #555',
                    borderRadius: '4px',
                    cursor: takenByOther ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    opacity: takenByOther ? 0.4 : 1,
                    boxShadow: selected ? `0 0 10px ${faction.color}66` : 'none',
                  }}
                >
                  {faction.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Start Button */}
      <button
        onClick={handleStart}
        style={{
          width: '100%',
          padding: '14px',
          marginTop: '16px',
          backgroundColor: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)',
        }}
      >
        START CAMPAIGN
      </button>
    </div>
  );
}
