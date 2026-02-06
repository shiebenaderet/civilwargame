// ============================================================
// Core Type Definitions for Civil War Strategy Game
// ============================================================

/** Axial hex coordinates (q = column, r = row) */
export interface HexCoord {
  q: number;
  r: number;
}

/** Cube hex coordinates for distance calculations */
export interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

export type Faction = 'union' | 'confederate';

export type UnitType = 'infantry' | 'cavalry' | 'artillery';

export type TerrainType =
  | 'plains'
  | 'forest'
  | 'hills'
  | 'river'
  | 'road'
  | 'town'
  | 'fortification'
  | 'bridge'
  | 'swamp';

export type GamePhase = 'setup' | 'movement' | 'combat' | 'end_turn' | 'game_over';

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;

// ---- Unit Types ----

export interface UnitStats {
  maxStrength: number;
  attack: number;
  defense: number;
  movement: number;
  range: number; // 1 for melee, 2+ for ranged (artillery)
  moraleDamage: number; // how much morale damage this unit inflicts
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  faction: Faction;
  commander: string;
  strength: number; // current men/guns
  maxStrength: number;
  morale: number; // 0-100
  experience: number; // 0-100, affects combat rolls
  movement: number; // remaining movement this turn
  maxMovement: number;
  attack: number;
  defense: number;
  range: number;
  position: HexCoord;
  hasActed: boolean; // has attacked this turn
  status: UnitStatus;
}

export type UnitStatus = 'ready' | 'moved' | 'engaged' | 'retreating' | 'routed' | 'eliminated';

// ---- Terrain & Map ----

export interface TerrainInfo {
  type: TerrainType;
  movementCost: number;
  defenseBonus: number;
  blocksLineOfSight: boolean;
  label?: string; // e.g., town name
}

export interface HexTile {
  coord: HexCoord;
  terrain: TerrainInfo;
  elevation: number; // 0-3, affects LOS and combat
  controlledBy: Faction | null;
  victoryPoint: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Map<string, HexTile>;
}

// ---- Combat ----

export interface CombatResult {
  attacker: {
    unitId: string;
    strengthLoss: number;
    moraleLoss: number;
    retreated: boolean;
    routed: boolean;
  };
  defender: {
    unitId: string;
    strengthLoss: number;
    moraleLoss: number;
    retreated: boolean;
    routed: boolean;
  };
  attackRoll: number;
  defenseRoll: number;
  modifiers: CombatModifier[];
}

export interface CombatModifier {
  source: string;
  value: number;
}

// ---- Game State ----

export interface GameState {
  turn: number;
  maxTurns: number;
  phase: GamePhase;
  currentFaction: Faction;
  map: GameMap;
  units: Unit[];
  combatLog: CombatLogEntry[];
  selectedUnitId: string | null;
  hoveredHex: HexCoord | null;
  victoryCondition: VictoryCondition;
  winner: Faction | null;
  historicalEvents: HistoricalEvent[];
  triggeredEvents: string[];
  aiEnabled: boolean;
}

export interface CombatLogEntry {
  turn: number;
  message: string;
  type: 'combat' | 'movement' | 'event' | 'morale' | 'victory';
}

export interface VictoryCondition {
  type: 'victory_points' | 'elimination' | 'turns';
  description: string;
}

// ---- Scenarios ----

export interface Scenario {
  id: string;
  name: string;
  description: string;
  year: number;
  historicalContext: string;
  mapWidth: number;
  mapHeight: number;
  maxTurns: number;
  terrain: ScenarioTerrain[];
  units: ScenarioUnit[];
  victoryCondition: VictoryCondition;
  historicalEvents: HistoricalEvent[];
  playerFaction: Faction;
}

export interface ScenarioTerrain {
  q: number;
  r: number;
  terrain: TerrainType;
  elevation?: number;
  label?: string;
  victoryPoint?: boolean;
}

export interface ScenarioUnit {
  name: string;
  type: UnitType;
  faction: Faction;
  commander: string;
  strength: number;
  experience: number;
  q: number;
  r: number;
}

export interface HistoricalEvent {
  id: string;
  turn: number;
  title: string;
  description: string;
  effect?: string;
  triggered: boolean;
}

// ---- AI ----

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIAction {
  type: 'move' | 'attack' | 'hold';
  unitId: string;
  target?: HexCoord;
  targetUnitId?: string;
}

// ---- Rendering ----

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface RenderConfig {
  hexSize: number;
  showGrid: boolean;
  showCoordinates: boolean;
  showFogOfWar: boolean;
  animationSpeed: number;
}
