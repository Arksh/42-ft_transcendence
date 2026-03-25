import { useState, useRef, useEffect } from 'react';
import Player, { createMockPlayers } from '../game/Player.js';
import TurnManager from '../game/TurnManager.js';
import { createScaledTerritories } from '../game/Territories.js';
import { FACTIONS, NEUTRAL_TERRITORIES } from '../game/Factions.js';
import mapPicking from '../assets/map_picking.png';
import { calculateScore, checkCapitalVictory, getScoreWinner } from '../game/Victory.js';

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 700;
const TERRITORIES = createScaledTerritories(CANVAS_WIDTH, CANVAS_HEIGHT);

export default function GameBoard() {
  const playerRecords = createMockPlayers(3);
  const players = playerRecords.map((record) => new Player(record));

  const tm = useRef(new TurnManager(players));
  const canvasRef = useRef(null);
  const pickingCanvasRef = useRef(null);
  const territoryPixelsRef = useRef({});
  const initializedRef = useRef(false);

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [phase, setPhase] = useState(null);

  // Initialize player and phase on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setCurrentPlayer(tm.current.getCurrentPlayer());
      setPhase(tm.current.phase);
    }
  }, []);

  const MAX_TURNS = 100;
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(null);
  const [activeFactions] = useState(players.map((p) => p.faction));

  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [reinforcementsLeft, setReinforcementsLeft] = useState(0);

  const [attackFrom, setAttackFrom] = useState(null);
  const [attackTo, setAttackTo] = useState(null);
  const [attackTroops, setAttackTroops] = useState(1);
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
      if (NEUTRAL_TERRITORIES.includes(territoryId) && !TERRITORIES[territoryId].isRegCapital) {
        counts[territoryId] = 2; // Inicialmente con 2 tropas
      } else if (TERRITORIES[territoryId].isRegCapital) {
        counts[territoryId] = 3; // Capitales regionales empiezan con 3 tropas
      } else {
        counts[territoryId] = 2; // Otros territorios empiezan con 2 tropas
      }
    });
    return counts;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
      pCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const imageData = pCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imageData.data;

      const colorMap = {};
      Object.entries(TERRITORIES).forEach(([id, t]) => {
        colorMap[t.colorKey] = id;
        territoryPixelsRef.current[id] = [];
      });

      for (let i = 0; i < data.length; i += 4) {
        const hex =
          '#' +
          [data[i], data[i + 1], data[i + 2]].map((c) => c.toString(16).padStart(2, '0')).join('');
        const id = colorMap[hex];
        if (id) {
          territoryPixelsRef.current[id].push([i / 4]);
        }
      }

      // DEBUG: dibuja la imagen de picking semitransparente encima del canvas visible
      ctx.globalAlpha = 0.0;
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1.0;
    };

    const highlighted = [attackFrom, attackTo, fortifyFrom, fortifyTo].filter(Boolean);
    highlighted.forEach((territoryId) => {
      const territory = TERRITORIES[territoryId];
      const pixels = territoryPixelsRef.current[territoryId];
      if (!territory || !pixels) return;

      pixels.forEach((pixelIndex) => {
        const x = pixelIndex % CANVAS_WIDTH;
        const y = Math.floor(pixelIndex / CANVAS_WIDTH);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, 1, 1);
      });

      ctx.beginPath();
      ctx.arc(territory.cx, territory.cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [
    territoryOwners /* Redibuja cuando cambian los propietarios */,
    troopCount,
    attackFrom,
    attackTo,
    fortifyFrom,
    fortifyTo,
  ]);

  async function handleNextTurn() {
    if (winner) return;

    const nextPlayer = await tm.current.nextTurn();
    setCurrentPlayer(nextPlayer);
    setPhase(tm.current.phase);

    if (tm.current.phase === TurnManager.PHASES.REINFORCE) {
      const newTurn = turn + 1;
      setTurn(newTurn);
      setReinforcementsLeft(calculateReinforcements(nextPlayer.faction));

      // Comprueba victoria por capitales
      const capitalWinner = activeFactions.find((fId) =>
        checkCapitalVictory(fId, territoryOwners, activeFactions)
      );
      if (capitalWinner) {
        setWinner({ factionId: capitalWinner, reason: 'capitals' });
        return;
      }

      // Comprueba victoria por turnos
      if (newTurn > MAX_TURNS) {
        const scoreWinner = getScoreWinner(territoryOwners, activeFactions);
        setWinner({ factionId: scoreWinner, reason: 'score' });
        return;
      }
      console.log(`Jugador ${nextPlayer.name} recibe ${reinforcementsLeft} tropas para reforzar.`);
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
    setFortifyTo(null);

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

    if (phase === TurnManager.PHASES.REINFORCE) {
      // Durante REINFORCE: click en territorio propio para colocar 1 tropa
      if (territoryOwners[clickedId] !== currentPlayer.faction) {
        console.log('No puedes reforzar un territorio que no posees:', clickedTerritory.name);
        return;
      }
      if (reinforcementsLeft <= 0) {
        console.log('No tienes refuerzos disponibles');
        return;
      }
      setTroopCount((prev) => ({
        ...prev,
        [clickedId]: prev[clickedId] + 1,
      }));
      setReinforcementsLeft((prev) => prev - 1);
      console.log(
        `Se añadió 1 tropa a ${clickedTerritory.name}. Refuerzos restantes: ${
          reinforcementsLeft - 1
        }`
      );
      return;
    }

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
        return setAttackFrom(null), setAttackTo(null);
      }
      if (clickedId === attackTo) {
        console.log('Deseleccionando origen de ataque:', clickedTerritory.name);
        return setAttackTo(null);
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
      setAttackTroops(1); // Reset slider to minimum on new target selection
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
        setFortifyTo(null);
        console.log('Fortificación: origen deseleccionado');
        return;
      }
      if (clickedId === fortifyTo) {
        setFortifyTo(null);
        console.log('Fortificación: destino deseleccionado');
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
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        margin: '0',
        padding: '20px 0',
      }}
    >
      <h1 style={{ textAlign: 'center', margin: '10px 0' }}>Great Risk</h1>

      {/* Main container: 80% map, 20% UI */}
      <div
        style={{
          width: `${CANVAS_WIDTH}px`,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh',
        }}
      >
        {/* Canvas area - 80% */}
        <div style={{ position: 'relative', display: 'inline-block', flex: '0 0 80%' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ border: '2px solid #333', display: 'block', width: '100%', height: '100%' }}
            onClick={handleCanvasClick}
          />
          <canvas
            ref={pickingCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ display: 'none' }}
          />

          {/* Territory info box (bottom-left of canvas) */}
          {selectedTerritory && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
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
        </div>

        {/* UI Bottom section - 20% - Three-way layout */}
        <div
          style={{
            flex: '0 0 20%',
            backgroundColor: '#1a1a1a',
            borderTop: '2px solid #333',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'monospace',
          }}
        >
          {/* LEFT: Player data */}
          <div style={{ color: 'white', fontSize: '13px', flex: 1 }}>
            {currentPlayer && (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{currentPlayer.name}</div>
                <div>Facción: {FACTIONS[currentPlayer.faction]?.name || 'Unknown'}</div>
                <div style={{ marginTop: '4px' }}>Fase: {phase}</div>
                {phase === TurnManager.PHASES.REINFORCE && (
                  <div style={{ marginTop: '4px', color: '#FFD700' }}>
                    Refuerzos: {reinforcementsLeft}
                  </div>
                )}
              </>
            )}
          </div>

          {/* CENTER: Turn info and button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
            }}
          >
            <div style={{ color: 'white', fontSize: '13px', textAlign: 'center' }}>
              <div>Turno</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFD700' }}>
                {turn} / {MAX_TURNS}
              </div>
            </div>
            <button
              onClick={handleNextTurn}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '140px',
              }}
            >
              Siguiente turno
            </button>
          </div>

          {/* RIGHT: Action controls (Fortify/Attack) */}
          <div style={{ flex: 1, minHeight: '60px' }}>
            {phase === TurnManager.PHASES.FORTIFY && fortifyFrom && fortifyTo && (
              <div style={{ color: 'white', fontSize: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                  {TERRITORIES[fortifyFrom].name} → {TERRITORIES[fortifyTo].name}
                </div>
                <input
                  type="range"
                  min={1}
                  max={troopCount[fortifyFrom] - 1}
                  value={fortifyTroops}
                  onChange={(e) => setFortifyTroops(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '4px' }}
                />
                <div style={{ marginBottom: '6px', fontSize: '11px' }}>Tropas: {fortifyTroops}</div>
                <button
                  onClick={() => handleFortify(fortifyTo)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    marginBottom: '3px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
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
                    padding: '4px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {phase === TurnManager.PHASES.ATTACK && attackFrom && attackTo && (
              <div style={{ color: 'white', fontSize: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                  {TERRITORIES[attackFrom].name} → {TERRITORIES[attackTo].name}
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.min(3, troopCount[attackFrom] - 1)}
                  value={attackTroops}
                  onChange={(e) => setAttackTroops(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '4px' }}
                />
                <div style={{ marginBottom: '6px', fontSize: '11px' }}>Tropas: {attackTroops}</div>
                <button
                  onClick={handleAttack}
                  style={{
                    width: '100%',
                    padding: '4px',
                    marginBottom: '3px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  ¡Atacar!
                </button>
                <button
                  onClick={() => {
                    setAttackFrom(null);
                    setAttackTo(null);
                    setAttackTroops(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '4px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {winner && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.95)',
            color: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 30,
            fontFamily: 'monospace',
            border: '2px solid #FFD700',
          }}
        >
          <h2>¡{FACTIONS[winner.factionId].name} gana!</h2>
          <p>
            {winner.reason === 'capitals'
              ? 'Ha conquistado todas las capitales enemigas'
              : `Victoria por puntos — ${calculateScore(winner.factionId, territoryOwners)} pts`}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Nueva partida
          </button>
        </div>
      )}
    </div>
  );
}
