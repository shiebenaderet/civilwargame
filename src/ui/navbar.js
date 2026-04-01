/**
 * Navbar stats display - updates score, soldiers, rank, battle number during gameplay.
 */
import { getRank, getRankEmoji } from '../engine/rank-system.js';
import { getElements } from './screens.js';

export function updateGameDisplay(gameState) {
    const elements = getElements();

    // Update navbar stats
    if (elements.navScore) elements.navScore.textContent = gameState.score.toLocaleString();
    if (elements.navSoldiers) elements.navSoldiers.textContent = gameState.soldiers.toLocaleString();
    if (elements.navBattleNumber) elements.navBattleNumber.textContent = gameState.currentBattle + 1;
    if (elements.navWins) elements.navWins.textContent = gameState.wins;

    // Update rank
    if (elements.navRank) {
        const rank = getRank(gameState.score);
        elements.navRank.textContent = getRankEmoji(rank) + ' ' + rank;
    }

    // Show/hide navbar stats and game actions during gameplay
    const isInGame = gameState.currentBattle > 0 || gameState.side;
    if (isInGame) {
        if (elements.navbarStats) elements.navbarStats.style.display = 'flex';
        if (elements.campaignLogNavBtn) elements.campaignLogNavBtn.style.display = 'block';
        const gameActionsSection = document.getElementById('gameActionsSection');
        const gameActionsDiv = document.getElementById('gameActionsDiv');
        if (gameActionsSection) gameActionsSection.style.display = 'block';
        if (gameActionsDiv) gameActionsDiv.style.display = 'block';
    } else {
        if (elements.navbarStats) elements.navbarStats.style.display = 'none';
        if (elements.campaignLogNavBtn) elements.campaignLogNavBtn.style.display = 'none';
        const gameActionsSection = document.getElementById('gameActionsSection');
        const gameActionsDiv = document.getElementById('gameActionsDiv');
        if (gameActionsSection) gameActionsSection.style.display = 'none';
        if (gameActionsDiv) gameActionsDiv.style.display = 'none';
    }
}
