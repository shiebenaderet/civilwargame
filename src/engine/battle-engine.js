/**
 * Core battle mechanics: probability calculation, morale, and outcome resolution.
 */

/**
 * Calculate effective win chance accounting for morale and army strength.
 * @param {number} baseChance - Base win percentage from the strategy data
 * @param {object} gameState - Current game state
 * @returns {number} Effective win chance clamped to 5-95%
 */
export function calculateEffectiveWinChance(baseChance, gameState) {
    let effective = baseChance;

    // Morale from consecutive wins/losses
    effective += gameState.morale;

    // Soldier ratio effect
    const startingSoldiers = gameState.side === 'union' ? 1500000 : 1000000;
    if (startingSoldiers > 0) {
        const ratio = gameState.soldiers / startingSoldiers;
        if (ratio >= 0.8) effective += 3;
        else if (ratio >= 0.6) effective += 0;
        else if (ratio >= 0.4) effective -= 3;
        else effective -= 7;
    }

    // Clamp to 5-95 so nothing is ever guaranteed
    return Math.max(5, Math.min(95, effective));
}

/**
 * Roll the dice against a win chance.
 * @param {number} winChance - Percentage chance to win (0-100)
 * @returns {boolean} Whether the battle was won
 */
export function rollBattle(winChance) {
    const roll = Math.random() * 100;
    return roll < winChance;
}

/**
 * Apply battle result to game state. Returns the result details.
 * @param {object} gameState - Mutable game state
 * @param {object} battle - Current battle data
 * @param {object} strategy - Chosen strategy
 * @param {object} sideData - Side-specific strategy data (winChance, soldierLoss, scoreGain)
 * @param {boolean} won - Whether the battle was won
 * @returns {object} Result details { actualLoss, actualScore }
 */
export function applyBattleResult(gameState, battle, strategy, sideData, won) {
    let actualLoss, actualScore;

    if (won) {
        actualLoss = Math.round(sideData.soldierLoss * 0.6);
        actualScore = sideData.scoreGain + 250;
        gameState.wins++;
        gameState.consecutiveWins++;
        gameState.consecutiveLosses = 0;
        gameState.morale = Math.min(15, gameState.consecutiveWins * 5);
    } else {
        actualLoss = Math.round(sideData.soldierLoss * 1.3);
        actualScore = Math.max(25, sideData.scoreGain - 50);
        gameState.losses++;
        gameState.consecutiveLosses++;
        gameState.consecutiveWins = 0;
        gameState.morale = Math.max(-15, -(gameState.consecutiveLosses * 5));
    }

    gameState.soldiers -= actualLoss;
    gameState.soldiers = Math.max(0, gameState.soldiers);
    gameState.score += actualScore;

    gameState.battleHistory.push({
        battleNumber: gameState.currentBattle + 1,
        name: battle.name,
        strategy: strategy.name,
        result: won ? 'Victory' : 'Defeat',
        casualties: actualLoss,
        scoreGained: actualScore
    });

    return { actualLoss, actualScore };
}

/**
 * Check if the game should end early.
 * @param {object} gameState
 * @param {number} totalBattles
 * @returns {boolean}
 */
export function shouldEndGame(gameState, totalBattles) {
    const requiredWins = gameState.side === 'union' ? 6 : 5;
    const battlesRemaining = totalBattles - (gameState.currentBattle + 1);

    if (gameState.wins >= requiredWins) return true;
    if (gameState.wins + battlesRemaining < requiredWins) return true;
    if (gameState.soldiers <= 0) return true;

    return false;
}

/**
 * Determine final victory/defeat.
 * @param {object} gameState
 * @returns {boolean} Whether the player won the campaign
 */
export function checkVictory(gameState) {
    const requiredWins = gameState.side === 'union' ? 6 : 5;
    return gameState.wins >= requiredWins && gameState.soldiers > 0;
}
