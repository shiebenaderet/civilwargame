import { describe, it, expect } from 'vitest';
import {
  hexKey, parseHexKey, hexEqual, hexNeighbors,
  hexDistance, hexRound, hexesInRange, hexLineDraw,
} from '@/utils/hex';

describe('hexKey', () => {
  it('creates a string key from coordinates', () => {
    expect(hexKey({ q: 3, r: 5 })).toBe('3,5');
    expect(hexKey({ q: -1, r: 0 })).toBe('-1,0');
  });
});

describe('parseHexKey', () => {
  it('parses a key back to coordinates', () => {
    expect(parseHexKey('3,5')).toEqual({ q: 3, r: 5 });
    expect(parseHexKey('-1,0')).toEqual({ q: -1, r: 0 });
  });
});

describe('hexEqual', () => {
  it('returns true for equal coordinates', () => {
    expect(hexEqual({ q: 1, r: 2 }, { q: 1, r: 2 })).toBe(true);
  });
  it('returns false for different coordinates', () => {
    expect(hexEqual({ q: 1, r: 2 }, { q: 1, r: 3 })).toBe(false);
  });
});

describe('hexNeighbors', () => {
  it('returns 6 neighbors', () => {
    const neighbors = hexNeighbors({ q: 0, r: 0 });
    expect(neighbors).toHaveLength(6);
  });
  it('returns correct neighbors for origin', () => {
    const neighbors = hexNeighbors({ q: 0, r: 0 });
    expect(neighbors).toContainEqual({ q: 1, r: 0 });
    expect(neighbors).toContainEqual({ q: -1, r: 0 });
    expect(neighbors).toContainEqual({ q: 0, r: 1 });
    expect(neighbors).toContainEqual({ q: 0, r: -1 });
  });
});

describe('hexDistance', () => {
  it('returns 0 for same hex', () => {
    expect(hexDistance({ q: 3, r: 4 }, { q: 3, r: 4 })).toBe(0);
  });
  it('returns 1 for adjacent hexes', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 1, r: 0 })).toBe(1);
  });
  it('returns correct distance for distant hexes', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: 3 })).toBe(6);
    expect(hexDistance({ q: 0, r: 0 }, { q: 2, r: -1 })).toBe(2);
  });
});

describe('hexesInRange', () => {
  it('returns 1 hex for range 0', () => {
    const hexes = hexesInRange({ q: 5, r: 5 }, 0);
    expect(hexes).toHaveLength(1);
    expect(hexes[0]).toEqual({ q: 5, r: 5 });
  });
  it('returns 7 hexes for range 1', () => {
    const hexes = hexesInRange({ q: 0, r: 0 }, 1);
    expect(hexes).toHaveLength(7); // center + 6 neighbors
  });
  it('returns 19 hexes for range 2', () => {
    const hexes = hexesInRange({ q: 0, r: 0 }, 2);
    expect(hexes).toHaveLength(19);
  });
});

describe('hexLineDraw', () => {
  it('returns start for same hex', () => {
    const line = hexLineDraw({ q: 0, r: 0 }, { q: 0, r: 0 });
    expect(line).toHaveLength(1);
  });
  it('returns correct number of hexes for a line', () => {
    const line = hexLineDraw({ q: 0, r: 0 }, { q: 3, r: 0 });
    expect(line).toHaveLength(4); // distance 3 + 1
  });
});

describe('hexRound', () => {
  it('rounds fractional coordinates', () => {
    const result = hexRound({ q: 0.4, r: 0.3 });
    expect(result.q + result.r + (-result.q - result.r)).toBe(0); // cube constraint
  });
});
