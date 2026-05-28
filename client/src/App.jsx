/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   App.jsx                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jrollon- <jrollon-@student.42madrid.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/28 13:47:37 by jrollon-          #+#    #+#             */
/*   Updated: 2026/05/28 15:12:31 by jrollon-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import './App.css';
import { useState } from 'react';
import Lobby from './components/Lobby.jsx';
import GameBoard from './components/Gameboard.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';

export default function App() {
	const [user, setUser] = useState(null); //guarda el usuario cuango loguea
	const [showRegister, setShowRegister] = useState(false); //toggle registro o login
	const [gameInfo, setGameInfo] = useState(null);

 	console.log('gameInfo:', gameInfo);
	console.log('roomId tipo:', typeof gameInfo?.roomId, gameInfo?.roomId);

	//1. Si no hay sesión iniciada (paso 2 autorización)
	if (!user){
		if (showRegister){
			return (<Register //para poner en varias lineas se necesita el paréntesis en el return.
					onLogin={setUser} //Una vez registrado meterle ya.
					onBack={() => setShowRegister(false)} //es como void onBack(){setShowRegister(false);} en C
					/> 
			);
		}
		//La primera vez muestra la pantalla de Login.
    	return (<Login 
				onLogin={setUser} //boton de ENTRAR al login
				onGoToRegister={() => setShowRegister(true)} //boton de registrar
				/>
		);
  	}

	//2. Si hay sesión pero no ha empezado la partida(lobby)
	if (!gameInfo){
		return (
      			<Lobby
				onStart={setGameInfo}
				initialPlayerId={user.username}
				onLogout={() => setUser(null)}
				/>
    	);
  	}

	//3. Si hay sesión y partida
	return <GameBoard roomId={gameInfo.roomId} playerId={gameInfo.playerId} />;
}
