import { useState, useRef, useEffect } from 'react';
import Player, { createMockPlayers } from '../game/Player.js';
import TurnManager from '../game/TurnManager.js';
import { TERRITORIES } from '../game/Territories.js';
import { FACTIONS, NEUTRAL_TERRITORIES } from '../game/Factions.js';
import mapPicking from '../assets/map_picking.png';

export default function GameBoard() {
  const playerRecords = createMockPlayers(3);
  const players = playerRecords.map((record) => new Player(record));

  const tm = useRef(new TurnManager(players));
  const canvasRef = useRef(null);
  const pickingCanvasRef = useRef(null);

  const [currentPlayer, setCurrentPlayer] = useState(tm.current.getCurrentPlayer());
  const [phase, setPhase] = useState(tm.current.phase);

  const [selectedTerritory, setSelectedTerritory] = useState(null);

  const [reinforcementsLeft, setReinforcementsLeft] = useState(0);

  const [attackFrom, setAttackFrom] = useState(null);
  const [attackTo, setAttackTo] = useState(null);
  const [attackTroops, setAttackTroops] = useState(0);
  const [territoriesAttackedThisTurn, setTerritoriesAttackedThisTurn] = useState(new Set());

  const [fortifyFrom, setFortifyFrom] = useState(null);
  const [fortifyTo, setFortifyTo] = useState(null);
  const [fortifyTroops, setFortifyTroops] = useState(1);

  const [territoryOwners, setTerritoryOwners] = useState(() => {
    const owners = {};

    // Asigna territorios a facciones
    Object.entries(FACTIONS).forEach(([factionId, faction]) => {
      faction.territories.forEach((territoryId) => {
        owners[territoryId] = factionId;
      });
    });

    // Asigna territorios neutrales
    NEUTRAL_TERRITORIES.forEach((territoryId) => {
      owners[territoryId] = null; // null indica neutral
    });

    return owners;
  });

  const [troopCount, setTroopCount] = useState(() => {
    const counts = {};
    Object.keys(TERRITORIES).forEach((territoryId) => {
      counts[territoryId] = 3; // Inicialmente con 3 tropas
    });
    return counts;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);

    const pickingCanvas = pickingCanvasRef.current;
    const pCtx = pickingCanvas.getContext('2d');
    const img = new Image();
    img.src = mapPicking;

    // Dibuja los territorios en el canvas de picking
    Object.entries(TERRITORIES).forEach(([, territory]) => {
      pCtx.beginPath();
      pCtx.arc(territory.cx, territory.cy, 15, 0, Math.PI * 2);
      pCtx.fillStyle = territory.colorKey;
      pCtx.fill();
    });

    // Dibuja las conexiones entre territorios
    Object.entries(TERRITORIES).forEach(([, territory]) => {
      territory.neighbors.forEach((neighborId) => {
        const neighbor = TERRITORIES[neighborId];
        if (!neighbor) return;

        ctx.beginPath();
        ctx.moveTo(territory.cx, territory.cy);
        ctx.lineTo(neighbor.cx, neighbor.cy);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // Dibuja los territorios en el canvas principal
    Object.entries(TERRITORIES).forEach(([id, territory]) => {
      const factionId = territoryOwners[id];
      const factionColor =
        factionId === 'neutral' ? '#888888' : FACTIONS[factionId]?.color ?? '#888888';
      ctx.fillStyle = factionColor;
      ctx.beginPath();
      ctx.arc(territory.cx, territory.cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = '9px Arial';
      ctx.fillText(territory.name, territory.cx - 10, territory.cy + 20);
    });

    img.onload = () => {
      pCtx.drawImage(img, 0, 0, 800, 600);

      // DEBUG: dibuja la imagen de picking semitransparente encima del canvas visible
      ctx.globalAlpha = 0.1;
      ctx.drawImage(img, 0, 0, 800, 600);
      ctx.globalAlpha = 1.0;
    };
  }, [territoryOwners]);

  async function handleNextTurn() {
    const nextPlayer = await tm.current.nextTurn();
    setCurrentPlayer(nextPlayer);
    setPhase(tm.current.phase);

    if (tm.current.phase === TurnManager.PHASES.REINFORCE) {
      const reinforcements = calculateReinforcements(nextPlayer.faction);
      setReinforcementsLeft(reinforcements);
      console.log(`Jugador ${nextPlayer.name} recibe ${reinforcements} tropas para reforzar.`);
    }

    // Reset attacked territories when entering ATTACK phase
    if (tm.current.phase === TurnManager.PHASES.ATTACK) {
      setTerritoriesAttackedThisTurn(new Set());
      console.log('Fase de ataque iniciada. Territorios pueden atacar nuevamente.');
    }
  }

  function calculateReinforcements(factionId) {
    const owned = Object.entries(territoryOwners)
      .filter(([, owner]) => owner === factionId)
      .map(([id]) => id);
    let total = Math.max(3, Math.floor(owned.length / 3));

    // Aquí irían los bonus futuros:
    // total += calculateRegionBonus(owned);
    // total += calculateCapitalBonus(owned);
    // total += calculateCardBonus(factionId);

    return total;
  }

  function handleFortify(destinationId) {
    setTroopCount((prev) => ({
      ...prev,
      [fortifyFrom]: prev[fortifyFrom] - fortifyTroops,
      [destinationId]: prev[destinationId] + fortifyTroops,
    }));
    setFortifyFrom(null);
    setFortifyTroops(1);
  }

  function handleAttack() {
    const defenderTroops = Math.min(3, troopCount[attackTo]);
    const { attackerLosses, defenderLosses, attackDice, defenseDice } = TurnManager.resolveCombat(
      attackTroops,
      defenderTroops
    );

    const newTroopCount = { ...troopCount };
    newTroopCount[attackFrom] -= attackerLosses;
    newTroopCount[attackTo] -= defenderLosses;

    if (newTroopCount[attackTo] <= 0) {
      newTroopCount[attackTo] = 1;
      newTroopCount[attackFrom] -= 1;
      setTerritoryOwners((prev) => ({ ...prev, [attackTo]: currentPlayer.faction }));
    }

    setTroopCount(newTroopCount);

    // Mark this territory as having attacked this turn
    setTerritoriesAttackedThisTurn((prev) => new Set([...prev, attackFrom]));

    setAttackFrom(null);
    setAttackTo(null);

    console.log(
      `Resultado del ataque: ${attackTroops} atacan a ${defenderTroops}\n` +
        `Dados de ataque: ${attackDice.join(', ')}\n` +
        `Dados de defensa: ${defenseDice.join(', ')}\n` +
        `Pérdidas del atacante: ${attackerLosses}\n` +
        `Pérdidas del defensor: ${defenderLosses}`
    );
  }

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pickingCanvas = pickingCanvasRef.current;
    const pCtx = pickingCanvas.getContext('2d');
    const pixel = pCtx.getImageData(x, y, 1, 1).data;
    const colorKey =
      '#' + [pixel[0], pixel[1], pixel[2]].map((c) => c.toString(16).padStart(2, '0')).join('');

    // console.log('Color leído:', colorKey);
    // console.log(
    //   'Colores disponibles:',
    //   Object.values(TERRITORIES).map((t) => t.colorKey)
    // );

    // Busca el territorio correspondiente al colorKey
    const found = Object.entries(TERRITORIES).find(([, t]) => t.colorKey === colorKey);
    if (!found) return;

    const [clickedId, clickedTerritory] = found;
    setSelectedTerritory({ id: clickedId, ...clickedTerritory });

    if (phase === TurnManager.PHASES.ATTACK) {
      // 1er clic en fase ATTACK: selecciona el territorio de origen
      if (!attackFrom) {
        if (territoryOwners[clickedId] !== currentPlayer.faction) {
          console.log('No puedes atacar desde un territorio que no posees:', clickedTerritory.name);
          return;
        }
        if (troopCount[clickedId] <= 1) {
          console.log(
            'No puedes atacar desde un territorio con 1 tropa o menos:',
            clickedTerritory.name
          );
          return;
        }
        if (territoriesAttackedThisTurn.has(clickedId)) {
          console.log('Este territorio ya ha atacado esta ronda:', clickedTerritory.name);
          return;
        }
        setAttackFrom(clickedId);
        console.log('Seleccionado para atacar desde:', clickedTerritory.name);
        return;
      }

      // 2do clic en fase ATTACK: selecciona el territorio de destino
      if (clickedId === attackFrom) {
        console.log('Deseleccionando origen de ataque:', clickedTerritory.name);
        return setAttackFrom(null);
      }

      if (territoryOwners[clickedId] === currentPlayer.faction) {
        console.log('No puedes atacar a un territorio que ya posees:', clickedTerritory.name);
        return;
      }
      if (!TERRITORIES[attackFrom].neighbors.includes(clickedId)) {
        console.log('Solo puedes atacar territorios vecinos:', clickedTerritory.name);
        return;
      }

      setAttackTo(clickedId);
      console.log('Seleccionado para atacar a:', clickedTerritory.name);
    }
    if (phase === TurnManager.PHASES.FORTIFY) {
      // 1er clic en fase FORTIFY: selecciona el territorio de origen
      if (!fortifyFrom) {
        if (territoryOwners[clickedId] !== currentPlayer.faction) return;
        if (troopCount[clickedId] <= 1) return;
        setFortifyFrom(clickedId);
        console.log('Fortificación: origen seleccionado -', clickedTerritory.name);
        return;
      }

      // 2do clic en fase FORTIFY: selecciona el territorio de destino (SIN mover tropas aún)
      if (clickedId === fortifyFrom) {
        setFortifyFrom(null);
        console.log('Fortificación: origen deseleccionado');
        return;
      }
      if (territoryOwners[clickedId] !== currentPlayer.faction) return;
      if (!TERRITORIES[fortifyFrom].neighbors.includes(clickedId)) return;

      // Solo establecer el destino, dejar que el botón "Mover" haga el cambio
      setFortifyTo(clickedId);
      console.log('Fortificación: destino seleccionado -', clickedTerritory.name);
    }
  }

  return (
    <div style={{ position: 'relative', width: '800px', margin: '20px auto' }}>
      <h1>Great Risk</h1>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: '2px solid #333', display: 'block' }}
          onClick={handleCanvasClick}
        />
        <canvas ref={pickingCanvasRef} width={800} height={600} style={{ display: 'none' }} />

        {/* Top-left game info box */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            minWidth: '180px',
            fontSize: '13px',
            fontFamily: 'monospace',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{currentPlayer.name}</div>
          <div>Fase: {phase}</div>
          {phase === TurnManager.PHASES.REINFORCE && <div>Refuerzos: {reinforcementsLeft}</div>}
        </div>

        {/* Territory info box (bottom-left) */}
        {selectedTerritory && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '6px',
              maxWidth: '250px',
              fontSize: '12px',
              fontFamily: 'monospace',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{selectedTerritory.name}</div>
            <div>Capital: {selectedTerritory.capital}</div>
            <div>
              Propietario:{' '}
              {territoryOwners[selectedTerritory.id]
                ? FACTIONS[territoryOwners[selectedTerritory.id]]?.name || 'Desconocido'
                : 'Neutral'}
            </div>
            <div>Tropas: {troopCount[selectedTerritory.id]}</div>
          </div>
        )}

        {/* Action box (bottom-right) */}
        {(phase === TurnManager.PHASES.FORTIFY || phase === TurnManager.PHASES.ATTACK) && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              maxWidth: '200px',
              fontSize: '12px',
              fontFamily: 'monospace',
              zIndex: 10,
            }}
          >
            {phase === TurnManager.PHASES.FORTIFY && fortifyFrom && fortifyTo && (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {TERRITORIES[fortifyFrom].name} → {TERRITORIES[fortifyTo].name}
                </div>
                <input
                  type="range"
                  min={1}
                  max={troopCount[fortifyFrom] - 1}
                  value={fortifyTroops}
                  onChange={(e) => setFortifyTroops(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '6px' }}
                />
                <div style={{ marginBottom: '8px' }}>Tropas: {fortifyTroops}</div>
                <button
                  onClick={() => handleFortify(fortifyTo)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '4px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Mover
                </button>
                <button
                  onClick={() => {
                    setFortifyFrom(null);
                    setFortifyTo(null);
                    setFortifyTroops(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {phase === TurnManager.PHASES.ATTACK && attackFrom && attackTo && (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {TERRITORIES[attackFrom].name} → {TERRITORIES[attackTo].name}
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.min(3, troopCount[attackFrom] - 1)}
                  value={attackTroops}
                  onChange={(e) => setAttackTroops(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '6px' }}
                />
                <div style={{ marginBottom: '8px' }}>Tropas: {attackTroops}</div>
                <button
                  onClick={handleAttack}
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '4px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  ¡Atacar!
                </button>
                <button
                  onClick={() => {
                    setAttackFrom(null);
                    setAttackTo(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <button
          onClick={handleNextTurn}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Siguiente turno
        </button>
      </div>
    </div>
  );
}
