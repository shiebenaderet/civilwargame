import type { HexCoord, GameMap, Unit } from '@/types';
import { hexKey, hexNeighbors } from '@/utils/hex';

interface PathNode {
  coord: HexCoord;
  cost: number;
  parent: string | null;
}

/**
 * Find all reachable hexes for a unit given its remaining movement.
 * Uses Dijkstra's algorithm with terrain movement costs.
 */
export function getReachableHexes(
  unit: Unit,
  map: GameMap,
  allUnits: Unit[]
): Map<string, number> {
  const reachable = new Map<string, number>();
  const frontier: PathNode[] = [{ coord: unit.position, cost: 0, parent: null }];
  const visited = new Map<string, number>();
  const startKey = hexKey(unit.position);
  visited.set(startKey, 0);

  while (frontier.length > 0) {
    // Get lowest cost node
    frontier.sort((a, b) => a.cost - b.cost);
    const current = frontier.shift()!;
    const currentKey = hexKey(current.coord);

    if (current.cost > unit.movement) continue;

    if (currentKey !== startKey) {
      reachable.set(currentKey, current.cost);
    }

    for (const neighbor of hexNeighbors(current.coord)) {
      const nKey = hexKey(neighbor);
      const tile = map.tiles.get(nKey);

      // Can't move off map
      if (!tile) continue;

      // Can't move through enemy units
      const occupant = allUnits.find(
        (u) => hexKey(u.position) === nKey && u.status !== 'eliminated' && u.status !== 'routed'
      );
      if (occupant && occupant.faction !== unit.faction) continue;

      // Can't stack friendly units
      if (occupant && occupant.id !== unit.id) continue;

      const moveCost = current.cost + tile.terrain.movementCost;
      if (moveCost > unit.movement) continue;

      const existingCost = visited.get(nKey);
      if (existingCost === undefined || moveCost < existingCost) {
        visited.set(nKey, moveCost);
        frontier.push({ coord: neighbor, cost: moveCost, parent: currentKey });
      }
    }
  }

  return reachable;
}

/**
 * Find the shortest path between two hexes.
 * Returns the path as an array of hex coordinates (including start and end).
 */
export function findPath(
  start: HexCoord,
  end: HexCoord,
  map: GameMap,
  allUnits: Unit[],
  faction: string
): HexCoord[] | null {
  const endKey = hexKey(end);
  const startKey = hexKey(start);

  if (startKey === endKey) return [start];

  const frontier: PathNode[] = [{ coord: start, cost: 0, parent: null }];
  const cameFrom = new Map<string, string | null>();
  const costSoFar = new Map<string, number>();

  cameFrom.set(startKey, null);
  costSoFar.set(startKey, 0);

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.cost - b.cost);
    const current = frontier.shift()!;
    const currentKey = hexKey(current.coord);

    if (currentKey === endKey) {
      // Reconstruct path
      const path: HexCoord[] = [];
      let key: string | null = endKey;
      while (key !== null) {
        const coord = key.split(',').map(Number);
        path.unshift({ q: coord[0], r: coord[1] });
        key = cameFrom.get(key) ?? null;
      }
      return path;
    }

    for (const neighbor of hexNeighbors(current.coord)) {
      const nKey = hexKey(neighbor);
      const tile = map.tiles.get(nKey);
      if (!tile) continue;

      const occupant = allUnits.find(
        (u) => hexKey(u.position) === nKey && u.status !== 'eliminated' && u.status !== 'routed'
      );
      if (occupant && occupant.faction !== faction) continue;
      if (occupant && occupant.id !== undefined && nKey !== endKey) continue;

      const newCost = (costSoFar.get(currentKey) ?? 0) + tile.terrain.movementCost;
      const existingCost = costSoFar.get(nKey);

      if (existingCost === undefined || newCost < existingCost) {
        costSoFar.set(nKey, newCost);
        cameFrom.set(nKey, currentKey);
        frontier.push({ coord: neighbor, cost: newCost, parent: currentKey });
      }
    }
  }

  return null; // No path found
}

/**
 * Get hexes that a unit can attack from its current position.
 */
export function getAttackableHexes(
  unit: Unit,
  map: GameMap,
  allUnits: Unit[]
): HexCoord[] {
  const targets: HexCoord[] = [];

  for (const otherUnit of allUnits) {
    if (otherUnit.faction === unit.faction) continue;
    if (otherUnit.status === 'eliminated' || otherUnit.status === 'routed') continue;

    const dist = hexDistanceImport(unit.position, otherUnit.position);
    if (dist <= unit.range) {
      // Check line of sight for ranged attacks
      if (dist > 1) {
        if (hasLineOfSight(unit.position, otherUnit.position, map)) {
          targets.push(otherUnit.position);
        }
      } else {
        targets.push(otherUnit.position);
      }
    }
  }

  return targets;
}

function hexDistanceImport(a: HexCoord, b: HexCoord): number {
  const aq = a.q, ar = a.r, as_ = -a.q - a.r;
  const bq = b.q, br = b.r, bs = -b.q - b.r;
  return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as_ - bs));
}

/**
 * Simple line-of-sight check: does anything block the view between two hexes?
 */
export function hasLineOfSight(from: HexCoord, to: HexCoord, map: GameMap): boolean {
  const n = hexDistanceImport(from, to);
  if (n <= 1) return true;

  for (let i = 1; i < n; i++) {
    const t = i / n;
    const q = from.q + (to.q - from.q) * t;
    const r = from.r + (to.r - from.r) * t;

    // Round to nearest hex
    const s = -q - r;
    let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;

    const tile = map.tiles.get(`${rq},${rr}`);
    if (tile && tile.terrain.blocksLineOfSight && tile.elevation > 0) {
      return false;
    }
  }

  return true;
}
