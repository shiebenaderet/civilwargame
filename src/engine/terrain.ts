import type { TerrainType, TerrainInfo } from '@/types';

export const TERRAIN_DEFAULTS: Record<TerrainType, TerrainInfo> = {
  plains: {
    type: 'plains',
    movementCost: 1,
    defenseBonus: 0,
    blocksLineOfSight: false,
  },
  forest: {
    type: 'forest',
    movementCost: 2,
    defenseBonus: 2,
    blocksLineOfSight: true,
  },
  hills: {
    type: 'hills',
    movementCost: 2,
    defenseBonus: 3,
    blocksLineOfSight: true,
  },
  river: {
    type: 'river',
    movementCost: 3,
    defenseBonus: -1,
    blocksLineOfSight: false,
  },
  road: {
    type: 'road',
    movementCost: 0.5,
    defenseBonus: 0,
    blocksLineOfSight: false,
  },
  town: {
    type: 'town',
    movementCost: 1,
    defenseBonus: 4,
    blocksLineOfSight: false,
  },
  fortification: {
    type: 'fortification',
    movementCost: 1,
    defenseBonus: 5,
    blocksLineOfSight: false,
  },
  bridge: {
    type: 'bridge',
    movementCost: 1,
    defenseBonus: -1,
    blocksLineOfSight: false,
  },
  swamp: {
    type: 'swamp',
    movementCost: 3,
    defenseBonus: -2,
    blocksLineOfSight: false,
  },
};

export function getTerrainInfo(type: TerrainType, label?: string): TerrainInfo {
  return { ...TERRAIN_DEFAULTS[type], label };
}

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  plains: '#8fbc6b',
  forest: '#2d5a1e',
  hills: '#a08050',
  river: '#4a7fb5',
  road: '#c4a86a',
  town: '#8b7355',
  fortification: '#6b6b6b',
  bridge: '#9b8b6b',
  swamp: '#5a6b4a',
};

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  plains: 'Plains',
  forest: 'Forest',
  hills: 'Hills',
  river: 'River',
  road: 'Road',
  town: 'Town',
  fortification: 'Fortification',
  bridge: 'Bridge',
  swamp: 'Swamp',
};
