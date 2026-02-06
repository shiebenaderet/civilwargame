import { useState, useEffect } from 'react';
import { useGameStore } from '@/engine/gameState';

export function HistoricalEventPopup() {
  const { historicalEvents, triggeredEvents } = useGameStore();
  const [visibleEvent, setVisibleEvent] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Show newly triggered events
  useEffect(() => {
    for (const eventId of triggeredEvents) {
      if (!dismissed.has(eventId) && visibleEvent !== eventId) {
        setVisibleEvent(eventId);
        break;
      }
    }
  }, [triggeredEvents, dismissed, visibleEvent]);

  const event = historicalEvents.find((e) => e.id === visibleEvent);
  if (!event) return null;

  const handleDismiss = () => {
    setDismissed((prev) => new Set(prev).add(event.id));
    setVisibleEvent(null);
  };

  return (
    <div style={styles.overlay} onClick={handleDismiss}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>Historical Event</div>
        <h2 style={styles.title}>{event.title}</h2>
        <div style={styles.divider} />
        <p style={styles.description}>{event.description}</p>
        {event.effect && (
          <p style={styles.effect}>{event.effect}</p>
        )}
        <button onClick={handleDismiss} style={styles.button}>
          Continue
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
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
    pointerEvents: 'auto',
  },
  popup: {
    background: 'linear-gradient(to bottom, #2a2518, #1e1a12)',
    border: '2px solid #aa8844',
    borderRadius: 10,
    padding: '30px 40px',
    maxWidth: 500,
    textAlign: 'center',
    boxShadow: '0 0 40px rgba(170, 136, 68, 0.3)',
  },
  header: {
    color: '#aa8844',
    fontSize: '0.8em',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#e0d8c0',
    fontSize: '1.6em',
    margin: '0 0 10px 0',
    fontFamily: "'Georgia', serif",
  },
  divider: {
    width: 60,
    height: 2,
    background: '#aa8844',
    margin: '0 auto 16px',
  },
  description: {
    color: '#b0a890',
    fontSize: '0.95em',
    lineHeight: 1.7,
    margin: '0 0 16px 0',
  },
  effect: {
    color: '#4CAF50',
    fontSize: '0.85em',
    fontStyle: 'italic',
    margin: '0 0 20px 0',
    padding: '8px 12px',
    background: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 4,
  },
  button: {
    background: 'linear-gradient(to bottom, #665522, #443311)',
    color: '#e0d8c0',
    border: '1px solid #aa8844',
    padding: '10px 36px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: "'Georgia', serif",
    fontSize: '0.95em',
    letterSpacing: '1px',
  },
};
