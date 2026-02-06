import type { HexCoord, HexTile, Unit, Faction, Camera } from '@/types';
import { hexToPixel, hexCorners } from '@/utils/hex';
import { TERRAIN_COLORS } from '@/engine/terrain';
import { FACTION_COLORS, UNIT_SYMBOLS } from '@/engine/units';

const HEX_SIZE = 38;

export interface HexRenderOptions {
  selectedUnitId: string | null;
  reachableHexes: Map<string, number>;
  attackTargets: HexCoord[];
  hoveredHex: HexCoord | null;
  currentFaction: Faction;
}

/**
 * Render the full hex map to a canvas context.
 */
export function renderMap(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  tiles: Map<string, HexTile>,
  units: Unit[],
  camera: Camera,
  options: HexRenderOptions
): void {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  // Render tiles
  tiles.forEach((tile) => {
    renderHexTile(ctx, tile, options);
  });

  // Render reachable overlay
  options.reachableHexes.forEach((_cost, key) => {
    const [q, r] = key.split(',').map(Number);
    renderHexOverlay(ctx, { q, r }, 'rgba(100, 200, 100, 0.3)', 'rgba(100, 200, 100, 0.6)');
  });

  // Render attack targets
  for (const target of options.attackTargets) {
    renderHexOverlay(ctx, target, 'rgba(255, 50, 50, 0.3)', 'rgba(255, 50, 50, 0.8)');
  }

  // Render hover
  if (options.hoveredHex) {
    renderHexOverlay(ctx, options.hoveredHex, 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.5)');
  }

  // Render units
  const activeUnits = units.filter((u) => u.status !== 'eliminated');
  for (const unit of activeUnits) {
    renderUnit(ctx, unit, unit.id === options.selectedUnitId);
  }

  ctx.restore();
}

function renderHexTile(
  ctx: CanvasRenderingContext2D,
  tile: HexTile,
  _options: HexRenderOptions
): void {
  const center = hexToPixel(tile.coord, HEX_SIZE);
  const corners = hexCorners(center, HEX_SIZE);

  // Fill hex
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();

  // Base color from terrain
  let color = TERRAIN_COLORS[tile.terrain.type];

  // Darken based on elevation
  if (tile.elevation > 0) {
    const brightFactor = 1 + tile.elevation * 0.08;
    color = adjustBrightness(color, brightFactor);
  }

  ctx.fillStyle = color;
  ctx.fill();

  // Hex border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Victory point marker
  if (tile.victoryPoint) {
    ctx.beginPath();
    ctx.arc(center.x, center.y - HEX_SIZE * 0.25, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#aa8800';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Terrain label
  if (tile.terrain.label) {
    ctx.font = `bold ${Math.floor(HEX_SIZE * 0.22)}px Georgia`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(tile.terrain.label, center.x, center.y + HEX_SIZE * 0.85);
  }
}

function renderHexOverlay(
  ctx: CanvasRenderingContext2D,
  coord: HexCoord,
  fill: string,
  stroke: string
): void {
  const center = hexToPixel(coord, HEX_SIZE);
  const corners = hexCorners(center, HEX_SIZE * 0.9);

  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function renderUnit(
  ctx: CanvasRenderingContext2D,
  unit: Unit,
  selected: boolean
): void {
  const center = hexToPixel(unit.position, HEX_SIZE);
  const colors = FACTION_COLORS[unit.faction];
  const radius = HEX_SIZE * 0.38;

  // Unit circle background
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);

  if (unit.status === 'routed') {
    ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
  } else {
    ctx.fillStyle = colors.primary;
  }
  ctx.fill();

  // Selection ring
  if (selected) {
    ctx.strokeStyle = '#ffdd00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Unit type symbol
  ctx.font = `${Math.floor(HEX_SIZE * 0.4)}px serif`;
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(UNIT_SYMBOLS[unit.type], center.x, center.y - 1);

  // Strength bar (below unit)
  const barWidth = radius * 1.6;
  const barHeight = 4;
  const barX = center.x - barWidth / 2;
  const barY = center.y + radius + 3;
  const strengthPercent = unit.strength / unit.maxStrength;

  // Bar background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Bar fill
  const barColor = strengthPercent > 0.6 ? '#4CAF50'
    : strengthPercent > 0.3 ? '#FF9800'
    : '#F44336';
  ctx.fillStyle = barColor;
  ctx.fillRect(barX, barY, barWidth * strengthPercent, barHeight);

  // Morale indicator (small dot)
  if (unit.morale < 40) {
    ctx.beginPath();
    ctx.arc(center.x + radius * 0.8, center.y - radius * 0.8, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();
  }
}

function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, Math.floor(r * factor));
  const ng = Math.min(255, Math.floor(g * factor));
  const nb = Math.min(255, Math.floor(b * factor));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/**
 * Convert screen coordinates to hex coordinates, accounting for camera.
 */
export function screenToHex(
  screenX: number,
  screenY: number,
  camera: Camera
): HexCoord {
  const worldX = (screenX - camera.x) / camera.zoom;
  const worldY = (screenY - camera.y) / camera.zoom;

  // Flat-top hex pixel-to-hex
  const q = (2 / 3 * worldX) / HEX_SIZE;
  const r = (-1 / 3 * worldX + Math.sqrt(3) / 3 * worldY) / HEX_SIZE;

  // Round to nearest hex
  const s = -q - r;
  let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;

  return { q: rq, r: rr };
}
