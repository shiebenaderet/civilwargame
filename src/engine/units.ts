import type { UnitType, UnitStats, Unit, Faction, HexCoord } from '@/types';

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  infantry: {
    maxStrength: 1000,
    attack: 5,
    defense: 5,
    movement: 3,
    range: 1,
    moraleDamage: 10,
  },
  cavalry: {
    maxStrength: 500,
    attack: 6,
    defense: 3,
    movement: 5,
    range: 1,
    moraleDamage: 15,
  },
  artillery: {
    maxStrength: 200,
    attack: 8,
    defense: 2,
    movement: 2,
    range: 3,
    moraleDamage: 20,
  },
};

let nextUnitId = 1;

export function createUnit(
  name: string,
  type: UnitType,
  faction: Faction,
  commander: string,
  position: HexCoord,
  strength?: number,
  experience?: number
): Unit {
  const stats = UNIT_STATS[type];
  const unitStrength = strength ?? stats.maxStrength;
  return {
    id: `unit_${nextUnitId++}`,
    name,
    type,
    faction,
    commander,
    strength: unitStrength,
    maxStrength: stats.maxStrength,
    morale: 80 + Math.floor(Math.random() * 20),
    experience: experience ?? 30 + Math.floor(Math.random() * 30),
    movement: stats.movement,
    maxMovement: stats.movement,
    attack: stats.attack,
    defense: stats.defense,
    range: stats.range,
    position,
    hasActed: false,
    status: 'ready',
  };
}

export function resetUnitId(): void {
  nextUnitId = 1;
}

export function resetUnitTurn(unit: Unit): Unit {
  if (unit.status === 'eliminated' || unit.status === 'routed') return unit;

  let newMorale = unit.morale;
  if (unit.status === 'retreating') {
    newMorale = Math.min(100, unit.morale + 5);
  }

  return {
    ...unit,
    movement: unit.maxMovement,
    hasActed: false,
    status: unit.status === 'retreating' ? 'ready' : 'ready',
    morale: newMorale,
  };
}

export function getUnitDisplayName(unit: Unit): string {
  return `${unit.name} (${unit.commander})`;
}

export function getUnitStrengthPercent(unit: Unit): number {
  return Math.round((unit.strength / unit.maxStrength) * 100);
}

export const UNIT_SYMBOLS: Record<UnitType, string> = {
  infantry: '\u2694',    // Crossed swords
  cavalry: '\u265E',     // Chess knight
  artillery: '\u2600',   // Sun (cannonball)
};

export const FACTION_COLORS: Record<Faction, { primary: string; secondary: string; text: string }> = {
  union: { primary: '#2255aa', secondary: '#3366cc', text: '#ffffff' },
  confederate: { primary: '#aa3333', secondary: '#cc4444', text: '#ffffff' },
};
