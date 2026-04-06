import { useState, useRef, useEffect } from 'react';
import TurnManager from '../game/TurnManager.js';
import { createScaledTerritories } from '../game/Territories.js';
import { FACTIONS, NEUTRAL_TERRITORIES } from '../game/Factions.js';
import mapPicking from '../assets/map_picking.png';
import { calculateScore, checkCapitalVictory, getScoreWinner } from '../game/Victory.js';
import Player, { createMockPlayers } from '../game/Player.js';

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 700;
const TERRITORIES = createScaledTerritories(CANVAS_WIDTH, CANVAS_HEIGHT);

// ========== INITIALIZATION HELPERS ==========
function initializeTerritoryOwners() {
  const owners = {};
  Object.entries(FACTIONS).forEach(([factionId, faction]) => {
    faction.territories.forEach((territoryId) => {
      owners[territoryId] = factionId;
    });
  });
  NEUTRAL_TERRITORIES.forEach((territoryId) => {
    owners[territoryId] = null;
  });
  return owners;
}

function initializeTroopCount() {
  const counts = {};
  Object.keys(TERRITORIES).forEach((territoryId) => {
    const isRegionalCapital = TERRITORIES[territoryId].isRegCapital;
    counts[territoryId] = isRegionalCapital ? 3 : 2;
  });
  return counts;
}

// export default function GameBoard({ players }) {
export default function GameBoard() {
  // ========== GAME SETUP ==========
  const playerRecords = createMockPlayers(3);
  const players = playerRecords.map((record) => new Player(record));
  const tm = useRef(new TurnManager(players));
  const MAX_TURNS = 100;

  // ========== CANVAS REFS ==========
  const canvasRef = useRef(null);
  const pickingCanvasRef = useRef(null);
  const territoryPixelsRef = useRef({});
  const initializedRef = useRef(false);

  // ========== GAME STATE ==========
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [phase, setPhase] = useState(null);
  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState(null);
  const [activeFactions] = useState(players.map((p) => p.faction));

  // ========== UI STATE ==========
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [hoveredTerritory, setHoveredTerritory] = useState(null);
  const [battleReport, setBattleReport] = useState(null);

  // ========== TERRITORY STATE ==========
  const [territoryOwners, setTerritoryOwners] = useState(initializeTerritoryOwners);
  const [troopCount, setTroopCount] = useState(initializeTroopCount);

  // ========== REINFORCE PHASE ==========
  const [reinforcementsLeft, setReinforcementsLeft] = useState(0);

  // ========== ATTACK PHASE ==========
  const [attackFrom, setAttackFrom] = useState(null);
  const [attackTo, setAttackTo] = useState(null);
  const [attackTroops, setAttackTroops] = useState(1);
  const [territoriesAttackedThisTurn, setTerritoriesAttackedThisTurn] = useState(new Set());

  // ========== FORTIFY PHASE ==========
  const [fortifyFrom, setFortifyFrom] = useState(null);
  const [fortifyTo, setFortifyTo] = useState(null);
  const [fortifyTroops, setFortifyTroops] = useState(1);

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setCurrentPlayer(tm.current.getCurrentPlayer());
      setPhase(tm.current.phase);
    }
  }, []);

  // ========== CANVAS SETUP ==========
  useEffect(() => {
    const pickingCanvas = pickingCanvasRef.current;
    const pCtx = pickingCanvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    img.src = mapPicking;

    img.onload = () => {
      // Draw color circles on picking canvas
      Object.entries(TERRITORIES).forEach(([, territory]) => {
        pCtx.beginPath();
        pCtx.arc(territory.cx, territory.cy, 15, 0, Math.PI * 2);
        pCtx.fillStyle = territory.colorKey;
        pCtx.fill();
      });

      // Draw the picking image on top
      pCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Process pixel data and cache it
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
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Drawing Territory connections
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

    // Drawing Territories on Canvas
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

    // Draw halo for hovered territory
    if (hoveredTerritory) {
      const territory = TERRITORIES[hoveredTerritory];
      const pixels = territoryPixelsRef.current[hoveredTerritory];
      if (territory && pixels) {
        pixels.forEach((pixelIndex) => {
          const x = pixelIndex % CANVAS_WIDTH;
          const y = Math.floor(pixelIndex / CANVAS_WIDTH);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(x, y, 1, 1);
        });
      }
    }

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
    hoveredTerritory,
  ]);

  // ========== TURN MANAGEMENT ==========
  async function handleNextTurn() {
    if (winner) return;

    setAttackFrom(null);
    setAttackTo(null);
    setFortifyFrom(null);
    setFortifyTo(null);

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

  // ========== REINFORCEMENTS ==========
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

  // ========== FORTIFY ACTIONS ==========
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

  // ========== COMBAT ACTIONS ==========
  function handleAttack() {
    const defenderTroops = Math.min(3, troopCount[attackTo]);
    const { attackerLosses, defenderLosses, attackDice, defenseDice, troopBonus } =
      TurnManager.resolveCombat(attackTroops, defenderTroops);

    const newTroopCount = { ...troopCount };
    newTroopCount[attackFrom] -= attackerLosses;
    newTroopCount[attackTo] -= defenderLosses;

    let conquered = false;
    if (newTroopCount[attackTo] <= 0) {
      newTroopCount[attackTo] = 1;
      newTroopCount[attackFrom] -= 1;
      setTerritoryOwners((prev) => ({ ...prev, [attackTo]: currentPlayer.faction }));
      conquered = true;
    }

    setTroopCount(newTroopCount);

    // Mark this territory as having attacked this turn
    setTerritoriesAttackedThisTurn((prev) => new Set([...prev, attackFrom]));

    // Store battle report
    setBattleReport({
      attackFrom: TERRITORIES[attackFrom].name,
      attackTo: TERRITORIES[attackTo].name,
      attackerTroops: attackTroops,
      defenderTroops,
      attackDice,
      defenseDice,
      attackerLosses,
      defenderLosses,
      conquered,
      troopBonus,
    });

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

  // ========== CANVAS INTERACTION ==========
  function getClickedTerritory(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pickingCanvas = pickingCanvasRef.current;
    const pCtx = pickingCanvas.getContext('2d', { willReadFrequently: true });
    const pixel = pCtx.getImageData(x, y, 1, 1).data;
    const colorKey =
      '#' + [pixel[0], pixel[1], pixel[2]].map((c) => c.toString(16).padStart(2, '0')).join('');

    const found = Object.entries(TERRITORIES).find(([, t]) => t.colorKey === colorKey);
    return found ? found[0] : null;
  }

  // ========== MOUSE HANDLERS ==========
  function handleCanvasMouseMove(e) {
    const territoryId = getClickedTerritory(e);
    setHoveredTerritory(territoryId);
  }

  function handleCanvasMouseLeave() {
    setHoveredTerritory(null);
  }

  // ========== CLICK HANDLERS ==========
  function handleCanvasClick(e) {
    const clickedId = getClickedTerritory(e);
    if (!clickedId) {
      // Clicked outside a territory, clear selection
      setSelectedTerritory(null);
      setFortifyFrom(null);
      setAttackFrom(null);
      setFortifyTo(null);
      setAttackTo(null);
      return;
    }

    const clickedTerritory = TERRITORIES[clickedId];

    // If clicking the same territory that's selected, deselect it
    if (selectedTerritory && selectedTerritory.id === clickedId) {
      setSelectedTerritory(null);
      return;
    }

    // Select the new territory
    setSelectedTerritory({ id: clickedId, ...clickedTerritory });

    // Game logic for REINFORCE phase
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

    // Game logic for ATTACK phase
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
        setAttackFrom(null);
        setAttackTo(null);
        return;
      }
      if (clickedId === attackTo) {
        console.log('Deseleccionando destino de ataque:', clickedTerritory.name);
        setAttackTo(null);
        return;
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
      return;
    }

    // Game logic for FORTIFY phase
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
        backgroundColor: '#0d0d0d',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          margin: '10px 0',
          color: '#FF6B6B',
          fontFamily: 'monospace',
          fontSize: '32px',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(255, 107, 107, 0.3)',
        }}
      >
        ⚔️ GREAT RISK ⚔️
      </h1>

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
            style={{
              border: '3px solid #FF6B6B',
              display: 'block',
              width: '100%',
              height: '100%',
              boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
          />
          <canvas
            ref={pickingCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ display: 'none' }}
          />

          {/* Territory info box (bottom-left of canvas) */}
          {(selectedTerritory || hoveredTerritory) && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: '#E0E0E0',
                padding: '12px',
                borderRadius: '6px',
                maxWidth: '250px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 10,
                border: '2px solid #6496FF',
                boxShadow: '0 0 15px rgba(100, 150, 255, 0.3)',
              }}
            >
              {(() => {
                const territory =
                  selectedTerritory || (hoveredTerritory && TERRITORIES[hoveredTerritory]);
                const territoryId = selectedTerritory?.id || hoveredTerritory;
                if (!territory) return null;
                return (
                  <>
                    <div style={{ fontWeight: 'bold', color: '#6496FF', marginBottom: '6px' }}>
                      {territory.name}
                    </div>
                    <div style={{ fontSize: '11px' }}>Capital: {territory.capital}</div>
                    <div style={{ fontSize: '11px' }}>
                      Propietario:{' '}
                      {territoryOwners[territoryId]
                        ? FACTIONS[territoryOwners[territoryId]]?.name || 'Desconocido'
                        : 'Neutral'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#FFD700', marginTop: '4px' }}>
                      Tropas: {troopCount[territoryId]}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* UI Bottom section - 20% - Three-way layout */}
        <div
          style={{
            flex: '0 0 20%',
            backgroundColor: '#0f0f0f',
            borderTop: '3px solid #FF6B6B',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'monospace',
            boxShadow: '0 -5px 15px rgba(255, 107, 107, 0.2)',
          }}
        >
          {/* LEFT: Player data */}
          <div style={{ color: '#E0E0E0', fontSize: '13px', flex: 1 }}>
            {currentPlayer && (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#6496FF' }}>
                  {currentPlayer.name}
                </div>
                <div>
                  Facción:{' '}
                  <span style={{ color: '#FFD700' }}>
                    {FACTIONS[currentPlayer.faction]?.name || 'Unknown'}
                  </span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  Fase: <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>{phase}</span>
                </div>
                {phase === TurnManager.PHASES.REINFORCE && (
                  <div style={{ marginTop: '4px', color: '#4CAF50', fontWeight: 'bold' }}>
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
                backgroundColor: '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '140px',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 10px rgba(255, 107, 107, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FF5252';
                e.target.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FF6B6B';
                e.target.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.3)';
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
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#45a049';
                    e.target.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#4CAF50';
                    e.target.style.boxShadow = 'none';
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
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FF5252';
                    e.target.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#FF6B6B';
                    e.target.style.boxShadow = 'none';
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
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FF5252';
                    e.target.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#FF6B6B';
                    e.target.style.boxShadow = 'none';
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
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FF5252';
                    e.target.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#FF6B6B';
                    e.target.style.boxShadow = 'none';
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
            border: '3px solid #FF6B6B',
            boxShadow: '0 0 30px rgba(255, 107, 107, 0.5)',
          }}
        >
          <h2 style={{ color: '#FF6B6B', marginTop: 0, marginBottom: '16px' }}>
            ¡{FACTIONS[winner.factionId].name} gana!
          </h2>
          <p style={{ color: '#E0E0E0', marginBottom: '20px' }}>
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
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.boxShadow = 'none';
            }}
          >
            Nueva partida
          </button>
        </div>
      )}

      {battleReport && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.95)',
            color: 'white',
            padding: '24px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 25,
            fontFamily: 'monospace',
            border: '2px solid #FF6B6B',
            maxWidth: '400px',
            boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
          }}
        >
          <h2 style={{ color: '#FF6B6B', marginTop: 0, marginBottom: '16px' }}>Battle Report</h2>

          <div
            style={{
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>{battleReport.attackFrom}</strong> <span style={{ color: '#FFD700' }}>→</span>{' '}
              <strong>{battleReport.attackTo}</strong>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {/* Attacker Column */}
            <div
              style={{
                backgroundColor: 'rgba(100, 150, 255, 0.2)',
                padding: '12px',
                borderRadius: '6px',
                borderLeft: '3px solid #6496FF',
              }}
            >
              <div style={{ fontSize: '12px', color: '#6496FF', marginBottom: '8px' }}>
                ATTACKER
              </div>
              <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                Troops: <strong>{battleReport.attackerTroops}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#CCC' }}>
                Dice: {battleReport.attackDice.join(', ')}
              </div>
            </div>

            {/* Defender Column */}
            <div
              style={{
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                padding: '12px',
                borderRadius: '6px',
                borderLeft: '3px solid #FF6B6B',
              }}
            >
              <div style={{ fontSize: '12px', color: '#FF6B6B', marginBottom: '8px' }}>
                DEFENDER
              </div>
              <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                Troops: <strong>{battleReport.defenderTroops}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#CCC' }}>
                Dice: {battleReport.defenseDice.join(', ')}
              </div>
            </div>
          </div>

          {/* Reinforcement Bonus Display */}
          {battleReport.troopBonus > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '16px',
                borderLeft: '3px solid #4CAF50',
              }}
            >
              <div style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 'bold' }}>
                ✦ Reinforcements increased attack in +{battleReport.troopBonus}
              </div>
            </div>
          )}

          {/* Losses */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '12px', marginBottom: '6px' }}>CASUALTIES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ color: '#6496FF', fontSize: '13px' }}>Attacker Losses</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9999' }}>
                  -{battleReport.attackerLosses}
                </div>
              </div>
              <div>
                <div style={{ color: '#FF6B6B', fontSize: '13px' }}>Defender Losses</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9999' }}>
                  -{battleReport.defenderLosses}
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div
            style={{
              backgroundColor: battleReport.conquered
                ? 'rgba(76, 175, 80, 0.2)'
                : 'rgba(255, 107, 107, 0.2)',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              borderLeft: `3px solid ${battleReport.conquered ? '#4CAF50' : '#FF6B6B'}`,
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: battleReport.conquered ? '#4CAF50' : '#FF9999',
              }}
            >
              {battleReport.conquered ? '✓ TERRITORY CONQUERED!' : '✗ Attack Failed'}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setBattleReport(null)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FF5252';
              e.target.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FF6B6B';
              e.target.style.boxShadow = 'none';
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
