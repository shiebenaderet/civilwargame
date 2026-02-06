import { useGameStore } from '@/engine/gameState';

interface VictoryScreenProps {
  onReturnToMenu: () => void;
}

export function VictoryScreen({ onReturnToMenu }: VictoryScreenProps) {
  const { winner, turn, units } = useGameStore();

  const unionSurvivors = units.filter((u) => u.faction === 'union' && u.status !== 'eliminated' && u.status !== 'routed');
  const confSurvivors = units.filter((u) => u.faction === 'confederate' && u.status !== 'eliminated' && u.status !== 'routed');
  const totalUnionStrength = unionSurvivors.reduce((sum, u) => sum + u.strength, 0);
  const totalConfStrength = confSurvivors.reduce((sum, u) => sum + u.strength, 0);

  const winnerLabel = winner === 'union' ? 'Union' : 'Confederate';
  const winnerColor = winner === 'union' ? '#2255aa' : '#aa3333';

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <h1 style={{ ...styles.title, color: winnerColor }}>
          {winnerLabel} Victory!
        </h1>

        <div style={styles.divider} />

        <div style={styles.statsSection}>
          <h3 style={styles.statsTitle}>Battle Summary</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statBlock}>
              <div style={{ color: '#2255aa', fontWeight: 'bold' }}>Union</div>
              <div>Units remaining: {unionSurvivors.length}</div>
              <div>Total strength: {totalUnionStrength}</div>
            </div>
            <div style={styles.statBlock}>
              <div style={{ color: '#aa3333', fontWeight: 'bold' }}>Confederate</div>
              <div>Units remaining: {confSurvivors.length}</div>
              <div>Total strength: {totalConfStrength}</div>
            </div>
          </div>
          <div style={styles.turnCount}>Battle ended on turn {turn}</div>
        </div>

        <div style={styles.historical}>
          {winner === 'union' ? (
            <p>Just as in history, the Union held the high ground and turned back the Confederate invasion. This victory, combined with the fall of Vicksburg the next day, marked the turning point of the war.</p>
          ) : (
            <p>You have changed history! Had Lee won at Gettysburg, the course of the war — and the nation — might have been very different. Would European powers have recognized the Confederacy? Would Lincoln have lost the 1864 election?</p>
          )}
        </div>

        <button onClick={onReturnToMenu} style={styles.button}>
          Return to Menu
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  panel: {
    background: 'rgba(30, 28, 22, 0.95)',
    border: '2px solid #665533',
    borderRadius: 12,
    padding: '40px 50px',
    maxWidth: 550,
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5em',
    margin: '0 0 10px 0',
    fontFamily: "'Georgia', serif",
  },
  divider: {
    width: 80,
    height: 2,
    background: '#665533',
    margin: '0 auto 20px',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsTitle: {
    color: '#c0b898',
    margin: '0 0 12px 0',
    fontSize: '1em',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    textAlign: 'left',
    fontSize: '0.9em',
    color: '#a0a0a0',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  turnCount: {
    marginTop: 12,
    color: '#888',
    fontSize: '0.85em',
  },
  historical: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
    color: '#a0a0a0',
    fontSize: '0.9em',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  button: {
    background: 'linear-gradient(to bottom, #554422, #443311)',
    color: '#e0d8c0',
    border: '1px solid #776644',
    padding: '12px 40px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: "'Georgia', serif",
    fontSize: '1em',
    letterSpacing: '1px',
  },
};
