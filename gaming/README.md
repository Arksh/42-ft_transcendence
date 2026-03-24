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

- Territory ownership and troop management (2-3 troops per territory)
- **Three game phases**:
  - **Reinforce**: Deploy reinforcements based on territory count
  - **Attack**: Conquer adjacent territories with dice-based combat
  - **Fortify**: Move troops between neighboring territories
- One-attack-per-territory restriction (defenders unlimited)
- Combat resolution with automatic dice rolling
- Territory conquest with automatic troop movement
- Canvas-based rendering with color-picking for territory selection
- Turn rotation between players with turn counter

### Victory Conditions

Two distinct ways to win:

1. **Capital Conquest** 🏰
   - Capture all enemy faction capitals
   - Each faction has a designated strategic capital
   - Immediate victory upon conquest

2. **Score Victory** 🏆
   - After 100 turns, highest territory count wins
   - Score calculated based on territories owned
   - Fallback victory if neither faction conquers all capitals

### Regional Capitals
- Marked territories with strategic importance
- Start with 3 troops (vs 2 for normal territories)
- Contribute to faction capital victory conditions

## Project Structure

```
src/
├── components/
│   └── Gameboard.jsx           # Main game interface
├── game/
│   ├── Territories.js          # Territory data with neighbors & capitals
│   ├── Factions.js             # Faction definitions with capitals
│   ├── Player.js               # Player class and factory
│   ├── TurnManager.js          # Turn, phase, & combat management
│   ├── Victory.js              # Victory condition checkers
│   └── validateConnections.js  # Territory connection validator
└── assets/
    └── map_picking.png         # Color-coded territory map
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
2. **Turn Structure**:
   - Player enters **REINFORCE** phase with reinforcements based on owned territories
   - Player enters **ATTACK** phase to conquer enemy territories
   - Player enters **FORTIFY** phase to move troops between territories
3. **Combat**:
   - Attacker selects territory and enemy target (must be adjacent)
   - Chooses number of attacking troops (1-3)
   - Automatic dice rolling determines casualties
   - Defending territory changes faction if all troops lost
4. **Victory Check**: After each REINFORCE phase:
   - Check if faction owns all enemy capitals (instant win)
   - Check if turn limit (100) exceeded → score-based winner
5. **Game End**: Winner displayed with victory screen and restart option

## Technical Stack

- **React 19.2.4** - UI framework
- **Vite 8.0.0** - Build tool with HMR
- **Canvas API** - Territory rendering and interaction
- **ES6+ Modules** - Clean code organization

## Future Enhancements

- [ ] Reinforcement phase UI (manual troop placement)
- [ ] Multiplayer networking
- [ ] Save/load game state
- [ ] Map expansion with more territories
- [ ] Sound effects and animations
- [ ] Player statistics and leaderboards
- [ ] Region control bonuses
- [ ] Card/mission system
- [ ] AI players for single-player mode
- [ ] Elo rating system
