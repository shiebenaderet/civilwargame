import { useRef, useEffect } from 'react';
import { useGameStore } from '@/engine/gameState';
import type { CombatLogEntry } from '@/types';

export function CombatLog() {
  const { combatLog } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combatLog.length]);

  return (
    <div style={styles.container}>
      <div style={styles.title}>Battle Log</div>
      <div ref={scrollRef} style={styles.scroll}>
        {combatLog.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function LogEntry({ entry }: { entry: CombatLogEntry }) {
  const color = LOG_COLORS[entry.type];
  return (
    <div style={{ ...styles.entry, borderLeft: `3px solid ${color}` }}>
      <span style={{ color: '#666', fontSize: '0.75em' }}>T{entry.turn} </span>
      <span style={{ color }}>{entry.message}</span>
    </div>
  );
}

const LOG_COLORS: Record<CombatLogEntry['type'], string> = {
  combat: '#ff6b6b',
  movement: '#6baaff',
  event: '#ffd700',
  morale: '#ff9800',
  victory: '#4CAF50',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    width: 320,
    maxHeight: 250,
    background: 'rgba(20, 20, 30, 0.92)',
    border: '1px solid #444',
    borderRadius: 6,
    overflow: 'hidden',
    pointerEvents: 'auto',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '0.85em',
    padding: '8px 12px',
    borderBottom: '1px solid #444',
    color: '#c0b898',
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 200,
    overflowY: 'auto',
    padding: 8,
  },
  entry: {
    fontSize: '0.78em',
    padding: '4px 8px',
    marginBottom: 4,
    lineHeight: 1.4,
  },
};
