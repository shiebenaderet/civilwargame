import type { Scenario } from '@/types';
import { gettysburgScenario } from '@/data/gettysburg';

interface MainMenuProps {
  onStartGame: (scenario: Scenario) => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Title */}
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Civil War</h1>
          <h2 style={styles.subtitle}>Strategy Game</h2>
          <div style={styles.divider} />
          <p style={styles.tagline}>
            Command armies. Shape history. Turn the tide of the war.
          </p>
        </div>

        {/* Scenario Selection */}
        <div style={styles.scenarios}>
          <ScenarioCard
            scenario={gettysburgScenario}
            onSelect={() => onStartGame(gettysburgScenario)}
          />
        </div>

        {/* Instructions */}
        <div style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>How to Play</h3>
          <div style={styles.instructionsList}>
            <InstructionItem icon="\u2694" text="Click your units to select them. Green hexes show where they can move." />
            <InstructionItem icon="\u{1F3AF}" text="In Combat Phase, select a unit and click an enemy in range (red hexes) to attack." />
            <InstructionItem icon="\u2B50" text="Capture Victory Points (gold stars) to win. Hold them at the end of the battle!" />
            <InstructionItem icon="\u{1F4DC}" text="Watch for historical events that bring the battle to life with real history." />
          </div>
        </div>

        <div style={styles.footer}>
          Right-click + drag to pan the map | Scroll to zoom
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, onSelect }: { scenario: Scenario; onSelect: () => void }) {
  return (
    <div style={styles.card} onClick={onSelect}>
      <div style={styles.cardYear}>{scenario.year}</div>
      <div style={styles.cardTitle}>{scenario.name}</div>
      <div style={styles.cardDesc}>{scenario.description}</div>
      <div style={styles.cardMeta}>
        {scenario.units.filter((u) => u.faction === 'union').length} Union units vs{' '}
        {scenario.units.filter((u) => u.faction === 'confederate').length} Confederate units |{' '}
        {scenario.maxTurns} turns
      </div>
      <button style={styles.playButton}>Begin Battle</button>
    </div>
  );
}

function InstructionItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={styles.instructionItem}>
      <span style={styles.instructionIcon}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
    overflow: 'auto',
  },
  content: {
    maxWidth: 700,
    padding: '40px 30px',
    textAlign: 'center',
  },
  titleBlock: {
    marginBottom: 40,
  },
  title: {
    fontSize: '3.5em',
    fontWeight: 'bold',
    color: '#e0d8c0',
    margin: 0,
    letterSpacing: '3px',
    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  subtitle: {
    fontSize: '1.3em',
    color: '#a09880',
    margin: '4px 0 0 0',
    fontWeight: 'normal',
    letterSpacing: '6px',
    textTransform: 'uppercase',
  },
  divider: {
    width: 100,
    height: 2,
    background: 'linear-gradient(to right, transparent, #776644, transparent)',
    margin: '20px auto',
  },
  tagline: {
    color: '#888',
    fontSize: '1em',
    fontStyle: 'italic',
    margin: 0,
  },
  scenarios: {
    marginBottom: 30,
  },
  card: {
    background: 'rgba(40, 35, 25, 0.8)',
    border: '1px solid #554422',
    borderRadius: 8,
    padding: 24,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  cardYear: {
    color: '#aa8844',
    fontSize: '0.85em',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#e0d8c0',
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#a0a0a0',
    fontSize: '0.9em',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  cardMeta: {
    color: '#777',
    fontSize: '0.8em',
    marginBottom: 16,
  },
  playButton: {
    background: 'linear-gradient(to bottom, #665522, #443311)',
    color: '#e0d8c0',
    border: '1px solid #887744',
    padding: '10px 32px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: "'Georgia', serif",
    fontSize: '1em',
    letterSpacing: '1px',
    width: '100%',
  },
  instructions: {
    background: 'rgba(30, 30, 40, 0.6)',
    border: '1px solid #333',
    borderRadius: 8,
    padding: 20,
    textAlign: 'left',
    marginBottom: 20,
  },
  instructionsTitle: {
    color: '#c0b898',
    fontSize: '1em',
    marginBottom: 12,
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  instructionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  instructionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: '0.85em',
    color: '#a0a0a0',
    lineHeight: 1.4,
  },
  instructionIcon: {
    fontSize: '1.2em',
    flexShrink: 0,
    width: 24,
    textAlign: 'center',
  },
  footer: {
    color: '#555',
    fontSize: '0.8em',
  },
};
