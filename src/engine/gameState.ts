import { create } from 'zustand';
import type {
  GameState, Unit, HexCoord, Faction,
  CombatLogEntry, GameMap, HexTile, Scenario,
} from '@/types';
import { hexKey, hexEqual } from '@/utils/hex';
import { getTerrainInfo } from './terrain';
import { createUnit, resetUnitTurn, resetUnitId } from './units';
import { resolveCombat } from './combat';
import { getReachableHexes, getAttackableHexes } from './pathfinding';

// ---- Helper to build map from scenario ----

function buildMap(scenario: Scenario): GameMap {
  const tiles = new Map<string, HexTile>();

  // Fill with default plains
  for (let q = 0; q < scenario.mapWidth; q++) {
    for (let r = 0; r < scenario.mapHeight; r++) {
      const key = hexKey({ q, r });
      tiles.set(key, {
        coord: { q, r },
        terrain: getTerrainInfo('plains'),
        elevation: 0,
        controlledBy: null,
        victoryPoint: false,
      });
    }
  }

  // Override with scenario terrain
  for (const st of scenario.terrain) {
    const key = hexKey({ q: st.q, r: st.r });
    const existing = tiles.get(key);
    if (existing) {
      tiles.set(key, {
        ...existing,
        terrain: getTerrainInfo(st.terrain, st.label),
        elevation: st.elevation ?? 0,
        victoryPoint: st.victoryPoint ?? false,
      });
    }
  }

  return { width: scenario.mapWidth, height: scenario.mapHeight, tiles };
}

function buildUnits(scenario: Scenario): Unit[] {
  resetUnitId();
  return scenario.units.map((su) =>
    createUnit(su.name, su.type, su.faction, su.commander, { q: su.q, r: su.r }, su.strength, su.experience)
  );
}

// ---- Store ----

export interface GameStore extends GameState {
  // Actions
  loadScenario: (scenario: Scenario) => void;
  selectUnit: (unitId: string | null) => void;
  hoverHex: (coord: HexCoord | null) => void;
  moveUnit: (unitId: string, to: HexCoord) => void;
  attackUnit: (attackerId: string, defenderId: string) => void;
  endPhase: () => void;
  endTurn: () => void;
  addLogEntry: (message: string, type: CombatLogEntry['type']) => void;
  getReachableHexes: (unitId: string) => Map<string, number>;
  getAttackTargets: (unitId: string) => HexCoord[];
  getUnitAt: (coord: HexCoord) => Unit | undefined;
  checkVictory: () => void;
  triggerEvents: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  turn: 1,
  maxTurns: 15,
  phase: 'setup',
  currentFaction: 'union',
  map: { width: 0, height: 0, tiles: new Map() },
  units: [],
  combatLog: [],
  selectedUnitId: null,
  hoveredHex: null,
  victoryCondition: { type: 'victory_points', description: 'Control key positions' },
  winner: null,
  historicalEvents: [],
  triggeredEvents: [],
  aiEnabled: true,

  // ---- Actions ----

  loadScenario: (scenario: Scenario) => {
    set({
      turn: 1,
      maxTurns: scenario.maxTurns,
      phase: 'movement',
      currentFaction: scenario.playerFaction,
      map: buildMap(scenario),
      units: buildUnits(scenario),
      combatLog: [{
        turn: 0,
        message: `${scenario.name} - ${scenario.historicalContext}`,
        type: 'event',
      }],
      selectedUnitId: null,
      hoveredHex: null,
      victoryCondition: scenario.victoryCondition,
      winner: null,
      historicalEvents: scenario.historicalEvents.map((e) => ({ ...e, triggered: false })),
      triggeredEvents: [],
    });
  },

  selectUnit: (unitId: string | null) => {
    set({ selectedUnitId: unitId });
  },

  hoverHex: (coord: HexCoord | null) => {
    set({ hoveredHex: coord });
  },

  moveUnit: (unitId: string, to: HexCoord) => {
    const state = get();
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit) return;
    if (unit.faction !== state.currentFaction) return;

    const reachable = getReachableHexes(unit, state.map, state.units);
    const toKey = hexKey(to);
    const cost = reachable.get(toKey);
    if (cost === undefined) return;

    const newUnits = state.units.map((u) =>
      u.id === unitId
        ? { ...u, position: to, movement: u.movement - cost, status: 'moved' as const }
        : u
    );

    set({ units: newUnits });
    get().addLogEntry(
      `${unit.name} moves to (${to.q}, ${to.r})`,
      'movement'
    );
  },

  attackUnit: (attackerId: string, defenderId: string) => {
    const state = get();
    const attacker = state.units.find((u) => u.id === attackerId);
    const defender = state.units.find((u) => u.id === defenderId);
    if (!attacker || !defender) return;
    if (attacker.faction !== state.currentFaction) return;
    if (attacker.hasActed) return;

    const attackerTile = state.map.tiles.get(hexKey(attacker.position));
    const defenderTile = state.map.tiles.get(hexKey(defender.position));

    const result = resolveCombat(attacker, defender, attackerTile, defenderTile);

    const newUnits = state.units.map((u) => {
      if (u.id === attackerId) {
        const newStrength = Math.max(0, u.strength - result.attacker.strengthLoss);
        const newMorale = Math.max(0, u.morale - result.attacker.moraleLoss);
        return {
          ...u,
          strength: newStrength,
          morale: newMorale,
          hasActed: true,
          experience: Math.min(100, u.experience + 3),
          status: result.attacker.routed
            ? 'routed' as const
            : result.attacker.retreated
              ? 'retreating' as const
              : 'engaged' as const,
        };
      }
      if (u.id === defenderId) {
        const newStrength = Math.max(0, u.strength - result.defender.strengthLoss);
        const newMorale = Math.max(0, u.morale - result.defender.moraleLoss);
        return {
          ...u,
          strength: newStrength,
          morale: newMorale,
          experience: Math.min(100, u.experience + 2),
          status: result.defender.routed
            ? 'routed' as const
            : result.defender.retreated
              ? 'retreating' as const
              : u.status,
        };
      }
      return u;
    });

    // Eliminate units with 0 strength
    const finalUnits = newUnits.map((u) =>
      u.strength <= 0 ? { ...u, status: 'eliminated' as const } : u
    );

    set({ units: finalUnits });

    // Build combat log message
    const winner = result.attackRoll > result.defenseRoll ? attacker.name : defender.name;
    const modSummary = result.modifiers.map((m) => `${m.source}: ${m.value > 0 ? '+' : ''}${m.value}`).join(', ');
    get().addLogEntry(
      `${attacker.name} attacks ${defender.name}! ` +
      `Roll: ${result.attackRoll} vs ${result.defenseRoll}. ${winner} prevails. ` +
      `Losses - Attacker: ${result.attacker.strengthLoss}, Defender: ${result.defender.strengthLoss}. ` +
      (modSummary ? `Modifiers: ${modSummary}` : ''),
      'combat'
    );

    if (result.defender.routed) {
      get().addLogEntry(`${defender.name} has been routed!`, 'morale');
    }
    if (result.attacker.routed) {
      get().addLogEntry(`${attacker.name} has been routed!`, 'morale');
    }

    get().checkVictory();
  },

  endPhase: () => {
    const state = get();
    if (state.phase === 'movement') {
      set({ phase: 'combat' });
    } else if (state.phase === 'combat') {
      get().endTurn();
    }
  },

  endTurn: () => {
    const state = get();
    const nextFaction: Faction = state.currentFaction === 'union' ? 'confederate' : 'union';
    const isNewRound = nextFaction === 'union'; // Union always goes first
    const nextTurn = isNewRound ? state.turn + 1 : state.turn;

    if (nextTurn > state.maxTurns) {
      get().checkVictory();
      set({ phase: 'game_over' });
      return;
    }

    // Reset units for the next faction
    const newUnits = state.units.map((u) =>
      u.faction === nextFaction ? resetUnitTurn(u) : u
    );

    set({
      turn: nextTurn,
      phase: 'movement',
      currentFaction: nextFaction,
      units: newUnits,
      selectedUnitId: null,
    });

    get().addLogEntry(
      `Turn ${nextTurn} - ${nextFaction === 'union' ? 'Union' : 'Confederate'} phase`,
      'event'
    );

    get().triggerEvents();
  },

  addLogEntry: (message: string, type: CombatLogEntry['type']) => {
    const state = get();
    set({
      combatLog: [...state.combatLog, { turn: state.turn, message, type }],
    });
  },

  getReachableHexes: (unitId: string) => {
    const state = get();
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit) return new Map();
    return getReachableHexes(unit, state.map, state.units);
  },

  getAttackTargets: (unitId: string) => {
    const state = get();
    const unit = state.units.find((u) => u.id === unitId);
    if (!unit) return [];
    return getAttackableHexes(unit, state.map, state.units);
  },

  getUnitAt: (coord: HexCoord) => {
    const state = get();
    return state.units.find(
      (u) => hexEqual(u.position, coord) && u.status !== 'eliminated'
    );
  },

  checkVictory: () => {
    const state = get();
    const unionAlive = state.units.filter(
      (u) => u.faction === 'union' && u.status !== 'eliminated' && u.status !== 'routed'
    );
    const confAlive = state.units.filter(
      (u) => u.faction === 'confederate' && u.status !== 'eliminated' && u.status !== 'routed'
    );

    if (unionAlive.length === 0) {
      set({ winner: 'confederate', phase: 'game_over' });
      get().addLogEntry('The Confederate forces are victorious!', 'victory');
    } else if (confAlive.length === 0) {
      set({ winner: 'union', phase: 'game_over' });
      get().addLogEntry('The Union forces are victorious!', 'victory');
    }

    // Check victory points
    if (state.victoryCondition.type === 'victory_points') {
      let unionVP = 0;
      let confVP = 0;
      state.map.tiles.forEach((tile) => {
        if (!tile.victoryPoint) return;
        const unitHere = state.units.find(
          (u) => hexEqual(u.position, tile.coord) && u.status !== 'eliminated'
        );
        if (unitHere?.faction === 'union') unionVP++;
        if (unitHere?.faction === 'confederate') confVP++;
      });

      if (state.turn >= state.maxTurns) {
        if (unionVP > confVP) {
          set({ winner: 'union', phase: 'game_over' });
          get().addLogEntry(`Union wins on victory points ${unionVP}-${confVP}!`, 'victory');
        } else if (confVP > unionVP) {
          set({ winner: 'confederate', phase: 'game_over' });
          get().addLogEntry(`Confederacy wins on victory points ${confVP}-${unionVP}!`, 'victory');
        }
      }
    }
  },

  triggerEvents: () => {
    const state = get();
    const newEvents = [...state.historicalEvents];
    const newTriggered = [...state.triggeredEvents];

    for (let i = 0; i < newEvents.length; i++) {
      const event = newEvents[i];
      if (!event.triggered && event.turn === state.turn) {
        newEvents[i] = { ...event, triggered: true };
        newTriggered.push(event.id);
        get().addLogEntry(`Historical Event: ${event.title} - ${event.description}`, 'event');
      }
    }

    set({ historicalEvents: newEvents, triggeredEvents: newTriggered });
  },
}));
