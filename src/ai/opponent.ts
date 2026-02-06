import type { Unit, HexCoord, GameMap, AIAction } from '@/types';
import { hexDistance } from '@/utils/hex';
import { getReachableHexes, getAttackableHexes } from '@/engine/pathfinding';

/**
 * AI Opponent - evaluates board state and chooses actions.
 * Strategy: prioritize attacking weak units, defending victory points,
 * and maintaining unit cohesion.
 */

export function getAIActions(
  aiUnits: Unit[],
  enemyUnits: Unit[],
  map: GameMap,
  allUnits: Unit[]
): AIAction[] {
  const actions: AIAction[] = [];
  const activeUnits = aiUnits.filter(
    (u) => u.status !== 'eliminated' && u.status !== 'routed'
  );
  const activeEnemies = enemyUnits.filter(
    (u) => u.status !== 'eliminated' && u.status !== 'routed'
  );

  for (const unit of activeUnits) {
    // 1. Check if we can attack
    const targets = getAttackableHexes(unit, map, allUnits);
    if (targets.length > 0 && !unit.hasActed) {
      // Find the best target (lowest strength/morale)
      const bestTarget = findBestTarget(unit, targets, activeEnemies);
      if (bestTarget) {
        actions.push({
          type: 'attack',
          unitId: unit.id,
          targetUnitId: bestTarget.id,
          target: bestTarget.position,
        });
        continue;
      }
    }

    // 2. Try to move toward objectives
    if (unit.movement > 0) {
      const moveTarget = findBestMoveTarget(unit, activeEnemies, map, allUnits);
      if (moveTarget) {
        actions.push({
          type: 'move',
          unitId: unit.id,
          target: moveTarget,
        });
        continue;
      }
    }

    // 3. Hold position
    actions.push({ type: 'hold', unitId: unit.id });
  }

  return actions;
}

function findBestTarget(
  attacker: Unit,
  targetHexes: HexCoord[],
  enemies: Unit[]
): Unit | null {
  let bestTarget: Unit | null = null;
  let bestScore = -Infinity;

  for (const hex of targetHexes) {
    const target = enemies.find(
      (u) => u.position.q === hex.q && u.position.r === hex.r
    );
    if (!target) continue;

    // Score: prefer low-strength, low-morale targets
    let score = 100;
    score -= (target.strength / target.maxStrength) * 50; // weaker = better target
    score -= (target.morale / 100) * 30; // lower morale = better target

    // Prefer artillery targets if we're artillery
    if (attacker.type === 'artillery' && target.type === 'artillery') {
      score += 20; // counter-battery fire
    }

    // Avoid attacking fortified positions
    if (target.defense > 7) {
      score -= 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  }

  return bestTarget;
}

function findBestMoveTarget(
  unit: Unit,
  enemies: Unit[],
  map: GameMap,
  allUnits: Unit[]
): HexCoord | null {
  const reachable = getReachableHexes(unit, map, allUnits);
  if (reachable.size === 0) return null;

  let bestHex: HexCoord | null = null;
  let bestScore = -Infinity;

  reachable.forEach((_cost, key) => {
    const [q, r] = key.split(',').map(Number);
    const hex: HexCoord = { q, r };
    let score = 0;

    // Move toward nearest enemy
    const nearestEnemy = findNearestEnemy(hex, enemies);
    if (nearestEnemy) {
      const dist = hexDistance(hex, nearestEnemy.position);
      // Get within attack range but not too close for artillery
      if (unit.type === 'artillery') {
        score += dist >= 2 && dist <= 3 ? 30 : -10;
      } else {
        score += (10 - dist) * 5; // closer is better for melee
      }
    }

    // Prefer defensive terrain
    const tile = map.tiles.get(key);
    if (tile) {
      score += tile.terrain.defenseBonus * 3;
      // Prefer victory points
      if (tile.victoryPoint) {
        score += 40;
      }
    }

    // Prefer higher ground
    if (tile && tile.elevation > 0) {
      score += tile.elevation * 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestHex = hex;
    }
  });

  return bestHex;
}

function findNearestEnemy(pos: HexCoord, enemies: Unit[]): Unit | null {
  let nearest: Unit | null = null;
  let minDist = Infinity;

  for (const enemy of enemies) {
    const dist = hexDistance(pos, enemy.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  }

  return nearest;
}
