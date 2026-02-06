import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/engine/gameState';
import { gettysburgScenario } from '@/data/gettysburg';

describe('game state', () => {
  beforeEach(() => {
    // Reset store between tests
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('loads a scenario correctly', () => {
    const store = useGameStore.getState();
    store.loadScenario(gettysburgScenario);

    const state = useGameStore.getState();
    expect(state.turn).toBe(1);
    expect(state.phase).toBe('movement');
    expect(state.currentFaction).toBe('union');
    expect(state.units.length).toBe(gettysburgScenario.units.length);
    expect(state.map.width).toBe(gettysburgScenario.mapWidth);
    expect(state.map.height).toBe(gettysburgScenario.mapHeight);
    expect(state.map.tiles.size).toBeGreaterThan(0);
  });

  it('selects and deselects units', () => {
    const store = useGameStore.getState();
    store.loadScenario(gettysburgScenario);

    const state = useGameStore.getState();
    const unionUnit = state.units.find((u) => u.faction === 'union');
    expect(unionUnit).toBeDefined();

    store.selectUnit(unionUnit!.id);
    expect(useGameStore.getState().selectedUnitId).toBe(unionUnit!.id);

    store.selectUnit(null);
    expect(useGameStore.getState().selectedUnitId).toBeNull();
  });

  it('can end a turn', () => {
    const store = useGameStore.getState();
    store.loadScenario(gettysburgScenario);

    expect(useGameStore.getState().currentFaction).toBe('union');

    store.endPhase(); // movement -> combat
    expect(useGameStore.getState().phase).toBe('combat');

    store.endPhase(); // combat -> end turn (switches to confederate)
    expect(useGameStore.getState().currentFaction).toBe('confederate');
  });

  it('switches factions each turn', () => {
    const store = useGameStore.getState();
    store.loadScenario(gettysburgScenario);

    // Union turn
    store.endPhase(); // movement -> combat
    store.endPhase(); // end turn -> confederate

    expect(useGameStore.getState().currentFaction).toBe('confederate');
    expect(useGameStore.getState().turn).toBe(1); // still turn 1

    store.endPhase(); // movement -> combat
    store.endPhase(); // end turn -> union (turn 2)

    expect(useGameStore.getState().currentFaction).toBe('union');
    expect(useGameStore.getState().turn).toBe(2);
  });

  it('adds combat log entries', () => {
    const store = useGameStore.getState();
    store.loadScenario(gettysburgScenario);

    const initialLogLength = useGameStore.getState().combatLog.length;
    store.addLogEntry('Test message', 'event');

    expect(useGameStore.getState().combatLog.length).toBe(initialLogLength + 1);
    expect(useGameStore.getState().combatLog[initialLogLength].message).toBe('Test message');
  });

  it('generates reachable hexes for a unit', () => {
    const store = useGameStore.getState();
    store.loadScenario(gettysburgScenario);

    const state = useGameStore.getState();
    const unionUnit = state.units.find((u) => u.faction === 'union');
    expect(unionUnit).toBeDefined();

    const reachable = store.getReachableHexes(unionUnit!.id);
    expect(reachable.size).toBeGreaterThan(0);
  });
});
