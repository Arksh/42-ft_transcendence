# Great Risk - Strategy Game

A turn-based strategy game inspired by Risk, built with React and Vite. Players control different factions competing for territorial dominance across a historical European map.

## Features

### Core Gameplay

- **Turn-based strategy system** with multiple game phases (Reinforce, Attack, Fortify)
- **44 Interactive territories** across Europe with bilateral neighbor connections
- **6 Playable factions** with unique colors:
  - 🔵 **France** (Blue) - #0055FF
  - 🟡 **Spain** (Gold) - #FFD700
  - 🔴 **England** (Red) - #FF0000
  - ⚪ **Austria** (Off-white) - #E8E8E8
  - 🟢 **Russia** (Green) - #00AA00
  - 🔻 **Ottoman Empire** (Dark Red) - #8B0000

### Game Mechanics

- Territory ownership and troop management
- Fortification phase for moving troops between adjacent territories
- Canvas-based rendering with color-picking for territory selection
- Turn rotation between players

## Project Structure

```
src/
├── components/
│   └── Gameboard.jsx       # Main game interface
├── game/
│   ├── Territories.js      # Territory data with neighbors
│   ├── Factions.js         # Faction definitions
│   ├── Player.js           # Player class and factory
│   ├── TurnManager.js      # Turn and phase management
│   └── validateConnections.js  # Territory connection validator
└── assets/
    └── map_picking.png     # Color-coded territory map
```

## Development

### Setup

```bash
npm install
npm run dev
```

### Validation

Verify that all territory connections are bilateral:

```bash
npm run validate:territories
```

This ensures map integrity, especially useful when expanding the map with new territories.

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Game Flow

1. **Initialization**: Three mock players are created with random faction assignments
2. **Turn Phases**:
   - **Reinforce**: Deploy reinforcements
   - **Attack**: Engage enemy territories
   - **Fortify**: Move troops between neighboring territories
3. **Turn Rotation**: Players take turns in sequence
4. **Territory Selection**: Click on territories to interact with them during fortify phase

## Technical Stack

- **React 19.2.4** - UI framework
- **Vite 8.0.0** - Build tool with HMR
- **Canvas API** - Territory rendering and interaction
- **ES6+ Modules** - Clean code organization

## Future Enhancements

- [ ] Attack phase implementation with dice rolling
- [ ] Reinforcement phase logic
- [ ] Multiplayer networking
- [ ] Save/load game state
- [ ] Map expansion with more territories
- [ ] Sound effects and animations
- [ ] Player statistics and leaderboards
