# Civil War Strategy Game

A browser-based, turn-based strategy game set during the American Civil War. Players command Union or Confederate forces across historically-inspired battlefields, managing infantry, cavalry, and artillery units in tactical combat.

## Features

- **Hex-grid tactical map** with terrain types (forests, hills, rivers, roads, towns)
- **Three unit types**: Infantry, Cavalry, Artillery — each with unique strengths
- **Turn-based gameplay** with movement, combat, and morale systems
- **AI opponent** with configurable difficulty
- **Historical scenarios** starting with the Battle of Gettysburg
- **Educational content**: historical events, commander bios, battle context
- **Fog of war** and line-of-sight mechanics
- **Morale and supply** systems that reward smart strategy over brute force

## Tech Stack

- TypeScript + React 18
- HTML5 Canvas for map rendering
- Zustand for state management
- Vite for build tooling
- Vitest for testing

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
src/
  engine/        # Core game logic (state, turns, combat, pathfinding)
  rendering/     # Canvas-based hex map renderer
  components/    # React UI components (HUD, menus, dialogs)
  data/          # Scenarios, unit definitions, terrain data
  ai/            # AI opponent logic
  utils/         # Shared utilities (hex math, random, etc.)
  types/         # TypeScript type definitions
  assets/        # Images, sounds, fonts
```

## Architecture

The game separates **engine** (pure logic, fully testable) from **rendering** (Canvas drawing) and **UI** (React components). The engine knows nothing about how it's displayed — it just manages state and rules. This makes it easy to test, extend, and eventually support multiplayer.

## Roadmap

- [x] Project scaffolding and architecture
- [ ] Core engine: hex grid, units, turns
- [ ] Map rendering with terrain
- [ ] Unit movement and pathfinding
- [ ] Combat system with dice + modifiers
- [ ] Morale and retreat mechanics
- [ ] AI opponent (basic → intermediate)
- [ ] Battle of Gettysburg scenario
- [ ] Historical events and educational popups
- [ ] Sound effects and animations
- [ ] Additional scenarios (Bull Run, Antietam, Shiloh)
- [ ] Campaign mode linking battles together
