import type { Unit, CombatResult, CombatModifier, HexTile } from '@/types';
import { hexDistance } from '@/utils/hex';

/**
 * Combat system:
 * - Each side rolls a "combat score" based on attack/defense + modifiers + dice
 * - Strength loss is proportional to the difference
 * - Morale damage is applied separately
 * - Retreating and routing can occur when morale drops
 */

function rollDice(sides: number = 6): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function calculateCombatModifiers(
  attacker: Unit,
  defender: Unit,
  attackerTerrain: HexTile | undefined,
  defenderTerrain: HexTile | undefined
): { attackMods: CombatModifier[]; defenseMods: CombatModifier[] } {
  const attackMods: CombatModifier[] = [];
  const defenseMods: CombatModifier[] = [];

  // Terrain defense bonus
  if (defenderTerrain) {
    const bonus = defenderTerrain.terrain.defenseBonus;
    if (bonus !== 0) {
      defenseMods.push({
        source: `${defenderTerrain.terrain.type} terrain`,
        value: bonus,
      });
    }
    // Elevation advantage
    if (attackerTerrain && defenderTerrain.elevation > attackerTerrain.elevation) {
      defenseMods.push({ source: 'Higher ground', value: 2 });
    }
    if (attackerTerrain && attackerTerrain.elevation > defenderTerrain.elevation) {
      attackMods.push({ source: 'Higher ground', value: 2 });
    }
  }

  // Experience bonus (every 25 exp = +1)
  const attackerExpBonus = Math.floor(attacker.experience / 25);
  if (attackerExpBonus > 0) {
    attackMods.push({ source: 'Experience', value: attackerExpBonus });
  }
  const defenderExpBonus = Math.floor(defender.experience / 25);
  if (defenderExpBonus > 0) {
    defenseMods.push({ source: 'Experience', value: defenderExpBonus });
  }

  // Morale modifier: low morale penalizes
  if (attacker.morale < 40) {
    attackMods.push({ source: 'Low morale', value: -2 });
  }
  if (defender.morale < 40) {
    defenseMods.push({ source: 'Low morale', value: -2 });
  }

  // Strength ratio modifier
  const ratio = attacker.strength / Math.max(1, defender.strength);
  if (ratio >= 2) {
    attackMods.push({ source: 'Outnumber 2:1', value: 3 });
  } else if (ratio >= 1.5) {
    attackMods.push({ source: 'Outnumber 3:2', value: 1 });
  } else if (ratio <= 0.5) {
    defenseMods.push({ source: 'Outnumber attacker 2:1', value: 3 });
  }

  // Flanking bonus for cavalry
  if (attacker.type === 'cavalry') {
    attackMods.push({ source: 'Cavalry charge', value: 2 });
  }

  // Artillery range bonus
  const dist = hexDistance(attacker.position, defender.position);
  if (attacker.type === 'artillery' && dist > 1) {
    attackMods.push({ source: 'Bombardment', value: 1 });
  }

  return { attackMods, defenseMods };
}

export function resolveCombat(
  attacker: Unit,
  defender: Unit,
  attackerTerrain: HexTile | undefined,
  defenderTerrain: HexTile | undefined
): CombatResult {
  const { attackMods, defenseMods } = calculateCombatModifiers(
    attacker, defender, attackerTerrain, defenderTerrain
  );

  // Calculate total modifiers
  const attackModTotal = attackMods.reduce((sum, m) => sum + m.value, 0);
  const defenseModTotal = defenseMods.reduce((sum, m) => sum + m.value, 0);

  // Roll combat dice (2d6 for each side)
  const attackRoll = rollDice(6) + rollDice(6) + attacker.attack + attackModTotal;
  const defenseRoll = rollDice(6) + rollDice(6) + defender.defense + defenseModTotal;

  // Calculate damage
  const attackDiff = attackRoll - defenseRoll;
  const baseDamage = Math.max(10, Math.abs(attackDiff) * 15);

  let attackerStrengthLoss: number;
  let defenderStrengthLoss: number;
  let attackerMoraleLoss: number;
  let defenderMoraleLoss: number;

  if (attackDiff > 0) {
    // Attacker wins
    defenderStrengthLoss = Math.min(defender.strength, Math.floor(baseDamage * 1.2));
    attackerStrengthLoss = Math.min(attacker.strength, Math.floor(baseDamage * 0.4));
    defenderMoraleLoss = Math.floor(baseDamage / 5) + 5;
    attackerMoraleLoss = Math.max(0, Math.floor(baseDamage / 10) - 2);
  } else if (attackDiff < 0) {
    // Defender wins
    defenderStrengthLoss = Math.min(defender.strength, Math.floor(baseDamage * 0.4));
    attackerStrengthLoss = Math.min(attacker.strength, Math.floor(baseDamage * 1.2));
    attackerMoraleLoss = Math.floor(baseDamage / 5) + 5;
    defenderMoraleLoss = Math.max(0, Math.floor(baseDamage / 10) - 2);
  } else {
    // Draw
    defenderStrengthLoss = Math.min(defender.strength, Math.floor(baseDamage * 0.6));
    attackerStrengthLoss = Math.min(attacker.strength, Math.floor(baseDamage * 0.6));
    defenderMoraleLoss = 5;
    attackerMoraleLoss = 5;
  }

  // Check for morale breaks
  const newAttackerMorale = Math.max(0, attacker.morale - attackerMoraleLoss);
  const newDefenderMorale = Math.max(0, defender.morale - defenderMoraleLoss);

  const attackerRetreats = newAttackerMorale < 25 && attackDiff < -3;
  const defenderRetreats = newDefenderMorale < 25 && attackDiff > 3;
  const attackerRoutes = newAttackerMorale <= 0 || attacker.strength - attackerStrengthLoss <= 0;
  const defenderRoutes = newDefenderMorale <= 0 || defender.strength - defenderStrengthLoss <= 0;

  return {
    attacker: {
      unitId: attacker.id,
      strengthLoss: attackerStrengthLoss,
      moraleLoss: attackerMoraleLoss,
      retreated: attackerRetreats && !attackerRoutes,
      routed: attackerRoutes,
    },
    defender: {
      unitId: defender.id,
      strengthLoss: defenderStrengthLoss,
      moraleLoss: defenderMoraleLoss,
      retreated: defenderRetreats && !defenderRoutes,
      routed: defenderRoutes,
    },
    attackRoll,
    defenseRoll,
    modifiers: [...attackMods, ...defenseMods],
  };
}
