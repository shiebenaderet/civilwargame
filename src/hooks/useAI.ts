import { useEffect } from 'react';
import { useGameStore } from '@/engine/gameState';
import { getAIActions } from '@/ai/opponent';

/**
 * Hook that runs the AI opponent when it's the AI's turn.
 * The AI plays the Confederate faction automatically.
 */
export function useAI() {
  const {
    currentFaction, phase, units, map, aiEnabled,
    moveUnit, attackUnit, endPhase,
  } = useGameStore();

  useEffect(() => {
    if (!aiEnabled) return;
    if (currentFaction !== 'confederate') return;
    if (phase !== 'movement' && phase !== 'combat') return;

    const aiUnits = units.filter((u) => u.faction === 'confederate');
    const enemyUnits = units.filter((u) => u.faction === 'union');

    const actions = getAIActions(aiUnits, enemyUnits, map, units);

    let delay = 600; // Start after a short delay
    const timeouts: number[] = [];

    for (const action of actions) {
      if (action.type === 'move' && action.target && phase === 'movement') {
        timeouts.push(
          window.setTimeout(() => {
            moveUnit(action.unitId, action.target!);
          }, delay)
        );
        delay += 400;
      }
      if (action.type === 'attack' && action.targetUnitId && phase === 'combat') {
        timeouts.push(
          window.setTimeout(() => {
            attackUnit(action.unitId, action.targetUnitId!);
          }, delay)
        );
        delay += 600;
      }
    }

    // End the phase after all actions
    timeouts.push(
      window.setTimeout(() => {
        endPhase();
      }, delay + 300)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [currentFaction, phase, aiEnabled]);
}
