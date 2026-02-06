import type { HexCoord, CubeCoord, Direction } from '@/types';

/**
 * Hex math utilities using axial coordinates (flat-top hexagons).
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */

// Axial direction vectors for flat-top hexagons
const DIRECTIONS: Record<Direction, HexCoord> = {
  0: { q: 1, r: 0 },   // East
  1: { q: 0, r: 1 },   // SE
  2: { q: -1, r: 1 },  // SW
  3: { q: -1, r: 0 },  // West
  4: { q: 0, r: -1 },  // NW
  5: { q: 1, r: -1 },  // NE
};

export function hexKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

export function parseHexKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexEqual(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

export function hexNeighbor(coord: HexCoord, direction: Direction): HexCoord {
  const d = DIRECTIONS[direction];
  return { q: coord.q + d.q, r: coord.r + d.r };
}

export function hexNeighbors(coord: HexCoord): HexCoord[] {
  return ([0, 1, 2, 3, 4, 5] as Direction[]).map((d) => hexNeighbor(coord, d));
}

export function axialToCube(hex: HexCoord): CubeCoord {
  return { q: hex.q, r: hex.r, s: -hex.q - hex.r };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return Math.max(
    Math.abs(ac.q - bc.q),
    Math.abs(ac.r - bc.r),
    Math.abs(ac.s - bc.s)
  );
}

/** Convert hex coordinate to pixel position (flat-top) */
export function hexToPixel(coord: HexCoord, size: number): { x: number; y: number } {
  const x = size * (3 / 2 * coord.q);
  const y = size * (Math.sqrt(3) / 2 * coord.q + Math.sqrt(3) * coord.r);
  return { x, y };
}

/** Convert pixel position to hex coordinate (flat-top) */
export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = (2 / 3 * x) / size;
  const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
  return hexRound({ q, r });
}

/** Round fractional hex coordinates to nearest hex */
export function hexRound(coord: { q: number; r: number }): HexCoord {
  const cube = { q: coord.q, r: coord.r, s: -coord.q - coord.r };
  let rq = Math.round(cube.q);
  let rr = Math.round(cube.r);
  let rs = Math.round(cube.s);
  const dq = Math.abs(rq - cube.q);
  const dr = Math.abs(rr - cube.r);
  const ds = Math.abs(rs - cube.s);

  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }
  // else rs = -rq - rr (not needed for axial)

  return { q: rq, r: rr };
}

/** Get all hexes within a given range */
export function hexesInRange(center: HexCoord, range: number): HexCoord[] {
  const results: HexCoord[] = [];
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  return results;
}

/** Draw a line between two hex coordinates */
export function hexLineDraw(a: HexCoord, b: HexCoord): HexCoord[] {
  const n = hexDistance(a, b);
  if (n === 0) return [a];

  const results: HexCoord[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const q = a.q + (b.q - a.q) * t;
    const r = a.r + (b.r - a.r) * t;
    results.push(hexRound({ q: q + 1e-6, r: r + 1e-6 }));
  }
  return results;
}

/** Get flat-top hex corner positions */
export function hexCorners(center: { x: number; y: number }, size: number): { x: number; y: number }[] {
  const corners: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    corners.push({
      x: center.x + size * Math.cos(angleRad),
      y: center.y + size * Math.sin(angleRad),
    });
  }
  return corners;
}
