import './App.css';
import { useState } from 'react';
import Lobby from './components/Lobby.jsx';
import GameBoard from './components/Gameboard.jsx';
import Login from './components/Login.jsx';

export default function App() {
  const [gameInfo, setGameInfo] = useState(null);
  const [userName, setUserName] = useState(null);
  const handleLogout = () => setUserName(null);

  if (!userName){
	return <Login onLogin={setUserName} />
  }
	console.log('gameInfo:', gameInfo);
	console.log('roomId tipo:', typeof gameInfo?.roomId, gameInfo?.roomId);
  return gameInfo
    ? <GameBoard roomId={gameInfo.roomId} playerId={gameInfo.playerId} />
    : <Lobby onStart={setGameInfo} initialPlayerId={userName} onLogout={handleLogout} />;
}
