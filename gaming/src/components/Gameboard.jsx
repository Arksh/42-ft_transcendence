import { useState, useRef, useEffect } from "react";
import Player, { createMockPlayers }  from "../game/Player.js";
import TurnManager from "../game/TurnManager.js";
import { TERRITORIES } from "../game/Territories.js";
import { FACTIONS, NEUTRAL_TERRITORIES } from "../game/Factions.js";
import mapPicking from "../assets/map_picking.png";

export default function GameBoard() {
	const playerRecords = createMockPlayers(3);
	const players = playerRecords.map(record => new Player(record));
	
	const tm = useRef(new TurnManager(players));
	const canvasRef = useRef(null);
	const pickingCanvasRef = useRef(null);

	const [currentPlayer, setCurrentPlayer] = useState(tm.current.getCurrentPlayer());
	const [phase, setPhase] = useState(tm.current.phase);
	const [selectedTerritory, setSelectedTerritory] = useState(null);

	const [territoryOwners, setTerritoryOwners] = useState(() => {
		const owners = {};

		// Asigna territorios a facciones
		Object.entries(FACTIONS).forEach(([factionId, faction]) => {
			faction.territories.forEach(territoryId => {
				owners[territoryId] = factionId;
			});
		});

		// Asigna territorios neutrales
		NEUTRAL_TERRITORIES.forEach(territoryId => {
			owners[territoryId] = null; // null indica neutral
		});
		
		return owners;
	});
	
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		
		const pickingCanvas = pickingCanvasRef.current;
		const pCtx = pickingCanvas.getContext("2d");
		const img = new Image();
		img.src = mapPicking;
		img.onload = () => {
		pCtx.drawImage(img, 0, 0, 800, 600);
		};
		
		
		// Dibuja los territorios en el canvas de picking
		Object.entries(TERRITORIES).forEach(([id, territory]) => {
			pCtx.beginPath();
			pCtx.arc(territory.cx, territory.cy, 15, 0, Math.PI * 2);
			pCtx.fillStyle = territory.colorKey;
			pCtx.fill();
		});

		// img.onload = () => {
		// pCtx.drawImage(img, 0, 0, 800, 600);
		
		// // DEBUG: dibuja la imagen de picking semitransparente encima del canvas visible
		// ctx.globalAlpha = 0.4;
		// ctx.drawImage(img, 0, 0, 800, 600);
		// ctx.globalAlpha = 1.0;
		// };	

		// Dibuja las conexiones entre territorios
		Object.entries(TERRITORIES).forEach(([id, territory]) => {
		territory.neighbors.forEach(neighborId => {
			const neighbor = TERRITORIES[neighborId];
			if (!neighbor) return;

			ctx.beginPath();
			ctx.moveTo(territory.cx, territory.cy);
			ctx.lineTo(neighbor.cx, neighbor.cy);
			ctx.strokeStyle = "rgba(0,0,0,0.3)";
			ctx.lineWidth = 1;
			ctx.stroke();
			});
		});

		// Dibuja los territorios en el canvas principal
		Object.entries(TERRITORIES).forEach(([id, territory]) => {
			const factionId = territoryOwners[id];
			const factionColor = factionId === "neutral" ? "#888888" : FACTIONS[factionId]?.color ?? "#888888";
			ctx.fillStyle = factionColor;
			ctx.beginPath();
			ctx.arc(territory.cx, territory.cy, 10, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = "white";
			ctx.stroke();

			ctx.fillStyle = "white";
			ctx.font = "9px Arial";
			ctx.fillText(territory.name, territory.cx - 10, territory.cy + 20);
		});
	}, []);
	
	async function handleNextTurn() {
		const nextPlayer = await tm.current.nextTurn();
		setCurrentPlayer(nextPlayer);
		setPhase(tm.current.phase);
	}

	function handleCanvasClick(e)
	{
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const pickingCanvas = pickingCanvasRef.current;
		const pCtx = pickingCanvas.getContext("2d");
		const pixel = pCtx.getImageData(x, y, 1, 1).data;
		const colorKey = "#" + [pixel[0], pixel[1], pixel[2]]
			.map(c => c.toString(16).padStart(2, "0"))
			.join("");

		console.log("Color leído:", colorKey);
		console.log("Colores disponibles:", Object.values(TERRITORIES).map(t => t.colorKey));
		// Busca el territorio correspondiente al colorKey
		const territory = Object.values(TERRITORIES).find(t => t.colorKey === colorKey);
		if (territory) {
			console.log("Territorio seleccionado:", territory.name);
			setSelectedTerritory({id: territory.id, ...territory});
		} else {
			console.log("No se seleccionó ningún territorio");
		}
	}


	return (
		<div>
			<h1>Great Risk</h1>
			<h2>Turno de: {currentPlayer.name}</h2>
			<p>Fase: {phase}</p>
			{selectedTerritory && (
  			  <p>Seleccionado: {selectedTerritory.name} — Capital: {selectedTerritory.capital}</p>
			  )}
			<canvas ref={canvasRef} width={800} height={600} style={{ border: "1px solid black" }} onClick={handleCanvasClick}/>
			<canvas ref={pickingCanvasRef} width={800} height={600} style={{ display: "none" }}/>
			<br></br>
			<button onClick={handleNextTurn}>Siguiente turno</button>
		</div>
	);
}