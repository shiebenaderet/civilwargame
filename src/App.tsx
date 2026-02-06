import { useState } from 'react';
import type { Scenario } from '@/types';
import { useGameStore } from '@/engine/gameState';
import { GameCanvas } from '@/components/GameCanvas';
import { HUD } from '@/components/HUD';
import { CombatLog } from '@/components/CombatLog';
import { MainMenu } from '@/components/MainMenu';
import { VictoryScreen } from '@/components/VictoryScreen';
import { HistoricalEventPopup } from '@/components/HistoricalEventPopup';
import { useAI } from '@/hooks/useAI';

type Screen = 'menu' | 'game';

export function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { phase, loadScenario } = useGameStore();

  // Run AI hook
  useAI();

  const handleStartGame = (scenario: Scenario) => {
    loadScenario(scenario);
    setScreen('game');
  };

  const handleReturnToMenu = () => {
    setScreen('menu');
  };

  if (screen === 'menu') {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GameCanvas />
      <HUD />
      <CombatLog />
      <HistoricalEventPopup />
      {phase === 'game_over' && (
        <VictoryScreen onReturnToMenu={handleReturnToMenu} />
      )}
    </div>
  );
}
