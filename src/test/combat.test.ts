import { describe, it, expect, beforeEach } from 'vitest';
import { resolveCombat, calculateCombatModifiers } from '@/engine/combat';
import { createUnit, resetUnitId } from '@/engine/units';
import type { HexTile } from '@/types';
import { getTerrainInfo } from '@/engine/terrain';

function makeTile(terrain: string, elevation = 0): HexTile {
  return {
    coord: { q: 0, r: 0 },
    terrain: getTerrainInfo(terrain as any),
    elevation,
    controlledBy: null,
    victoryPoint: false,
  };
}

describe('combat system', () => {
  beforeEach(() => {
    resetUnitId();
  });

  it('produces a combat result with all required fields', () => {
    const attacker = createUnit('Union Inf', 'infantry', 'union', 'Gen. A', { q: 0, r: 0 });
    const defender = createUnit('Conf Inf', 'infantry', 'confederate', 'Gen. B', { q: 1, r: 0 });
    const plainsTile = makeTile('plains');

    const result = resolveCombat(attacker, defender, plainsTile, plainsTile);

    expect(result.attacker.unitId).toBe(attacker.id);
    expect(result.defender.unitId).toBe(defender.id);
    expect(result.attacker.strengthLoss).toBeGreaterThanOrEqual(0);
    expect(result.defender.strengthLoss).toBeGreaterThanOrEqual(0);
    expect(typeof result.attackRoll).toBe('number');
    expect(typeof result.defenseRoll).toBe('number');
  });

  it('terrain defense bonus is applied', () => {
    const attacker = createUnit('Union Inf', 'infantry', 'union', 'Gen. A', { q: 0, r: 0 });
    const defender = createUnit('Conf Inf', 'infantry', 'confederate', 'Gen. B', { q: 1, r: 0 });
    const plainsTile = makeTile('plains');
    const fortTile = makeTile('fortification');

    const { defenseMods } = calculateCombatModifiers(
      attacker, defender, plainsTile, fortTile
    );

    const defenseBonus = defenseMods.find((m) => m.source.includes('fortification'));
    expect(defenseBonus).toBeDefined();
    expect(defenseBonus!.value).toBeGreaterThan(0);
  });

  it('elevation advantage is applied', () => {
    const attacker = createUnit('Union Inf', 'infantry', 'union', 'Gen. A', { q: 0, r: 0 });
    const defender = createUnit('Conf Inf', 'infantry', 'confederate', 'Gen. B', { q: 1, r: 0 });
    const lowTile = makeTile('plains', 0);
    const highTile = makeTile('hills', 2);

    const { defenseMods } = calculateCombatModifiers(
      attacker, defender, lowTile, highTile
    );

    const heightBonus = defenseMods.find((m) => m.source === 'Higher ground');
    expect(heightBonus).toBeDefined();
  });

  it('cavalry gets charge bonus', () => {
    const cavalryAttacker = createUnit('Union Cav', 'cavalry', 'union', 'Gen. A', { q: 0, r: 0 });
    const defender = createUnit('Conf Inf', 'infantry', 'confederate', 'Gen. B', { q: 1, r: 0 });
    const plainsTile = makeTile('plains');

    const { attackMods } = calculateCombatModifiers(
      cavalryAttacker, defender, plainsTile, plainsTile
    );

    const chargeBonus = attackMods.find((m) => m.source === 'Cavalry charge');
    expect(chargeBonus).toBeDefined();
    expect(chargeBonus!.value).toBe(2);
  });

  it('strength losses do not exceed unit strength', () => {
    const attacker = createUnit('Union Inf', 'infantry', 'union', 'Gen. A', { q: 0, r: 0 }, 50);
    const defender = createUnit('Conf Inf', 'infantry', 'confederate', 'Gen. B', { q: 1, r: 0 }, 50);
    const plainsTile = makeTile('plains');

    const result = resolveCombat(attacker, defender, plainsTile, plainsTile);

    expect(result.attacker.strengthLoss).toBeLessThanOrEqual(50);
    expect(result.defender.strengthLoss).toBeLessThanOrEqual(50);
  });
});
