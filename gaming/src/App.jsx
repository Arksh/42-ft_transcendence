import './App.css';
import { useState } from 'react';
import Lobby from './components/Lobby.jsx';
import GameBoard from './components/Gameboard.jsx';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return gameStarted ? <GameBoard /> : <Lobby onStart={() => setGameStarted(true)} />;
}
