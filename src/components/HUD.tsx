import { useGameStore } from '@/engine/gameState';
import { getUnitStrengthPercent, FACTION_COLORS } from '@/engine/units';
import { TERRAIN_LABELS } from '@/engine/terrain';
import { hexKey } from '@/utils/hex';
import type { Unit } from '@/types';

export function HUD() {
  const {
    turn, maxTurns, phase, currentFaction, units,
    selectedUnitId, hoveredHex, map,
    endPhase, selectUnit,
  } = useGameStore();

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const hoveredTile = hoveredHex ? map.tiles.get(hexKey(hoveredHex)) : null;
  const hoveredUnit = hoveredHex
    ? units.find((u) => u.position.q === hoveredHex.q && u.position.r === hoveredHex.r && u.status !== 'eliminated')
    : null;

  const factionLabel = currentFaction === 'union' ? 'Union' : 'Confederate';
  const factionColor = FACTION_COLORS[currentFaction].primary;

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.turnInfo}>
          <span style={{ color: factionColor, fontWeight: 'bold', fontSize: '1.1em' }}>
            {factionLabel}
          </span>
          <span style={styles.turnText}>Turn {turn}/{maxTurns}</span>
          <span style={styles.phaseText}>
            {phase === 'movement' ? 'Movement Phase' : phase === 'combat' ? 'Combat Phase' : phase}
          </span>
        </div>
        <div style={styles.controls}>
          {phase !== 'game_over' && phase !== 'setup' && (
            <button onClick={endPhase} style={styles.button}>
              {phase === 'movement' ? 'End Movement \u2192 Combat' : 'End Turn \u2192'}
            </button>
          )}
        </div>
      </div>

      {/* Selected Unit Panel */}
      {selectedUnit && (
        <div style={styles.unitPanel}>
          <UnitDetail unit={selectedUnit} />
        </div>
      )}

      {/* Hover Info */}
      {hoveredTile && !selectedUnit && (
        <div style={styles.hoverPanel}>
          <div style={styles.hoverTitle}>
            {hoveredTile.terrain.label || TERRAIN_LABELS[hoveredTile.terrain.type]}
          </div>
          <div style={styles.hoverDetail}>
            Terrain: {TERRAIN_LABELS[hoveredTile.terrain.type]}
            {hoveredTile.elevation > 0 && ` (Elevation ${hoveredTile.elevation})`}
          </div>
          <div style={styles.hoverDetail}>
            Movement cost: {hoveredTile.terrain.movementCost} | Defense: {hoveredTile.terrain.defenseBonus > 0 ? '+' : ''}{hoveredTile.terrain.defenseBonus}
          </div>
          {hoveredTile.victoryPoint && (
            <div style={{ color: '#ffd700', fontWeight: 'bold', marginTop: 4 }}>
              \u2605 Victory Point
            </div>
          )}
          {hoveredUnit && (
            <div style={{ marginTop: 8, borderTop: '1px solid #555', paddingTop: 8 }}>
              <UnitDetail unit={hoveredUnit} compact />
            </div>
          )}
        </div>
      )}

      {/* Unit List (side panel) */}
      <div style={styles.unitList}>
        <div style={styles.unitListTitle}>Your Forces</div>
        {units
          .filter((u) => u.faction === currentFaction && u.status !== 'eliminated')
          .map((u) => (
            <div
              key={u.id}
              onClick={() => selectUnit(u.id)}
              style={{
                ...styles.unitListItem,
                borderLeft: u.id === selectedUnitId ? '3px solid #ffdd00' : '3px solid transparent',
                opacity: u.status === 'routed' ? 0.5 : 1,
              }}
            >
              <span>{u.name}</span>
              <span style={{ color: getStrengthColor(getUnitStrengthPercent(u)) }}>
                {getUnitStrengthPercent(u)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function UnitDetail({ unit, compact = false }: { unit: Unit; compact?: boolean }) {
  const strengthPct = getUnitStrengthPercent(unit);
  const factionColor = FACTION_COLORS[unit.faction].primary;

  return (
    <div>
      <div style={{ color: factionColor, fontWeight: 'bold', fontSize: compact ? '0.9em' : '1.1em' }}>
        {unit.name}
      </div>
      <div style={styles.unitSubtitle}>{unit.commander} | {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}</div>
      {!compact && (
        <>
          <div style={styles.statRow}>
            <StatBar label="Strength" value={strengthPct} color={getStrengthColor(strengthPct)} detail={`${unit.strength}/${unit.maxStrength}`} />
          </div>
          <div style={styles.statRow}>
            <StatBar label="Morale" value={unit.morale} color={unit.morale > 50 ? '#4CAF50' : '#FF9800'} detail={`${unit.morale}/100`} />
          </div>
          <div style={styles.statsGrid}>
            <span>ATK: {unit.attack}</span>
            <span>DEF: {unit.defense}</span>
            <span>MOV: {unit.movement}/{unit.maxMovement}</span>
            <span>RNG: {unit.range}</span>
            <span>EXP: {unit.experience}</span>
            <span>Status: {unit.status}</span>
          </div>
        </>
      )}
      {compact && (
        <div style={styles.statsGrid}>
          <span>STR: {strengthPct}%</span>
          <span>MRL: {unit.morale}</span>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, color, detail }: { label: string; value: number; color: string; detail: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginBottom: 2 }}>
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 3, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function getStrengthColor(pct: number): string {
  if (pct > 60) return '#4CAF50';
  if (pct > 30) return '#FF9800';
  return '#F44336';
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'linear-gradient(to bottom, rgba(20, 20, 30, 0.95), rgba(20, 20, 30, 0.7))',
    pointerEvents: 'auto',
  },
  turnInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  turnText: {
    color: '#c0b898',
    fontSize: '1em',
  },
  phaseText: {
    color: '#a0a0a0',
    fontSize: '0.9em',
    fontStyle: 'italic',
  },
  controls: {
    display: 'flex',
    gap: 8,
  },
  button: {
    background: 'linear-gradient(to bottom, #554422, #443311)',
    color: '#e0d8c0',
    border: '1px solid #776644',
    padding: '8px 20px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9em',
    letterSpacing: '0.5px',
  },
  unitPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 280,
    background: 'rgba(20, 20, 30, 0.92)',
    border: '1px solid #444',
    borderRadius: 6,
    padding: 16,
    pointerEvents: 'auto',
  },
  hoverPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 250,
    background: 'rgba(20, 20, 30, 0.88)',
    border: '1px solid #444',
    borderRadius: 6,
    padding: 12,
    pointerEvents: 'none',
  },
  hoverTitle: {
    fontWeight: 'bold',
    fontSize: '1em',
    marginBottom: 4,
  },
  hoverDetail: {
    fontSize: '0.85em',
    color: '#a0a0a0',
    marginBottom: 2,
  },
  unitSubtitle: {
    color: '#a0a0a0',
    fontSize: '0.85em',
    marginBottom: 8,
  },
  statRow: {
    marginBottom: 4,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2px 12px',
    fontSize: '0.8em',
    color: '#c0b898',
    marginTop: 8,
  },
  unitList: {
    position: 'absolute',
    top: 60,
    right: 10,
    width: 220,
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    background: 'rgba(20, 20, 30, 0.88)',
    border: '1px solid #444',
    borderRadius: 6,
    padding: 8,
    pointerEvents: 'auto',
  },
  unitListTitle: {
    fontWeight: 'bold',
    fontSize: '0.9em',
    marginBottom: 8,
    color: '#c0b898',
    textAlign: 'center',
    borderBottom: '1px solid #444',
    paddingBottom: 6,
  },
  unitListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 8px',
    fontSize: '0.8em',
    cursor: 'pointer',
    borderRadius: 3,
    marginBottom: 2,
  },
};
