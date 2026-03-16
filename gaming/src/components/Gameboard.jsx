import { useState, useRef, useEffect } from "react";
import Player, { createMockPlayers }  from "../game/Player.js";
import TurnManager from "../game/TurnManager.js";
import { TERRITORIES } from "../game/Territories.js";

export default function GameBoard() {
	const playerRecords = createMockPlayers(3);
	const players = playerRecords.map(record => new Player(record));
	
	const tm = useRef(new TurnManager(players));
	const canvasRef = useRef(null);
	
	const [currentPlayer, setCurrentPlayer] = useState(tm.current.getCurrentPlayer());
	const [phase, setPhase] = useState(tm.current.phase);
	
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		
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

		Object.entries(TERRITORIES).forEach(([id, territory]) => {
			ctx.beginPath();
			ctx.arc(territory.cx, territory.cy, 10, 0, Math.PI * 2);
			ctx.fillStyle = "gray";
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

	return (
		<div>
			<h1>Great Risk</h1>
			<h2>Turno de: {currentPlayer.name}</h2>
			<p>Fase: {phase}</p>
			<canvas ref={canvasRef} width={750} height={500} style={{ border: "1px solid black" }}/>
			<br></br>
			<button onClick={handleNextTurn}>Siguiente turno</button>
		</div>
	);
}