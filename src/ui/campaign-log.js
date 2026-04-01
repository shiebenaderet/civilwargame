/**
 * Campaign log modal - battle timeline, stats, and strategy analysis.
 */
import { trapFocus, getElements } from './screens.js';

export function showCampaignLog(gameState) {
    const elements = getElements();
    updateCampaignLog(gameState);
    elements.campaignLogModal.style.display = 'block';
    setTimeout(() => trapFocus(elements.campaignLogModal), 100);
}

export function closeCampaignLog() {
    const elements = getElements();
    elements.campaignLogModal.style.display = 'none';
}

export function updateCampaignLog(gameState) {
    // Overview stats
    document.getElementById('battlesCompleted').textContent = gameState.battleHistory.length;
    document.getElementById('winsCount').textContent = gameState.wins;
    document.getElementById('currentScore').textContent = gameState.score.toLocaleString();

    // Victory progress
    const requiredWins = gameState.side === 'union' ? 6 : 5;
    const progressPercent = Math.min((gameState.wins / requiredWins) * 100, 100);
    document.getElementById('victoryFill').style.width = `${progressPercent}%`;
    document.getElementById('victoryText').textContent = `${gameState.wins} of ${requiredWins} wins needed`;

    // Battle timeline
    const timelineContainer = document.getElementById('timelineContainer');
    timelineContainer.innerHTML = '';

    if (gameState.battleHistory.length === 0) {
        timelineContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No battles fought yet.</p>';
    } else {
        gameState.battleHistory.forEach(battle => {
            const item = document.createElement('div');
            item.className = `timeline-item ${battle.result.toLowerCase()}`;
            item.innerHTML = `
                <div class="timeline-battle">Battle ${battle.battleNumber}: ${battle.name}</div>
                <div class="timeline-details">
                    Strategy: ${battle.strategy}<br>
                    Result: ${battle.result === 'Victory' ? '\u2705' : '\u274C'} ${battle.result}<br>
                    Casualties: ${battle.casualties.toLocaleString()} soldiers
                </div>
            `;
            timelineContainer.appendChild(item);
        });
    }

    // Strategy analysis
    updateStrategyAnalysis(gameState);
}

function updateStrategyAnalysis(gameState) {
    const strategyStats = document.getElementById('strategyStats');

    if (gameState.battleHistory.length === 0) {
        strategyStats.innerHTML = '<p style="text-align: center; color: #888;">Strategy analysis will appear after battles.</p>';
        return;
    }

    const strategies = {
        aggressive: {
            count: 0, wins: 0,
            names: ['Direct Attack', 'Immediate Counterattack', 'Coordinated Assault', 'Attack the Center',
                'Direct Assault', 'Exploit the Gap', 'Push Through Despite Losses', 'Aggressive Field Battle', 'Fight to the End']
        },
        defensive: {
            count: 0, wins: 0,
            names: ['Defensive Position', 'Form Defensive Lines', 'Hold the High Ground', 'Artillery Bombardment First',
                'Hold Defensive Positions', 'Steady Pressure', 'Defensive Stand', 'Wait for Better Terrain', 'Defend the City']
        },
        tactical: {
            count: 0, wins: 0,
            names: ['Flanking Movement', 'Strategic Retreat', 'Cautious Advance', 'Focus on Escape Routes',
                'Flanking Maneuver', 'Find Alternative Crossing', 'Attack While Enemy is Divided',
                'Withdraw to Open Ground', 'Try to Outmaneuver', "Attack Sherman's Supply Lines",
                'Attempt Breakout', 'Honorable Surrender']
        }
    };

    gameState.battleHistory.forEach(battle => {
        let strategyType = 'tactical';
        if (strategies.aggressive.names.includes(battle.strategy)) strategyType = 'aggressive';
        else if (strategies.defensive.names.includes(battle.strategy)) strategyType = 'defensive';

        strategies[strategyType].count++;
        if (battle.result === 'Victory') strategies[strategyType].wins++;
    });

    strategyStats.innerHTML = `
        <div class="strategy-type">
            <div class="strategy-name">Aggressive</div>
            <div class="strategy-count" style="color: #dc2626;">${strategies.aggressive.count}</div>
            <div class="strategy-success">${strategies.aggressive.count > 0 ? Math.round((strategies.aggressive.wins / strategies.aggressive.count) * 100) : 0}% success rate</div>
        </div>
        <div class="strategy-type">
            <div class="strategy-name">Defensive</div>
            <div class="strategy-count" style="color: #3b82f6;">${strategies.defensive.count}</div>
            <div class="strategy-success">${strategies.defensive.count > 0 ? Math.round((strategies.defensive.wins / strategies.defensive.count) * 100) : 0}% success rate</div>
        </div>
        <div class="strategy-type">
            <div class="strategy-name">Tactical</div>
            <div class="strategy-count" style="color: #7c3aed;">${strategies.tactical.count}</div>
            <div class="strategy-success">${strategies.tactical.count > 0 ? Math.round((strategies.tactical.wins / strategies.tactical.count) * 100) : 0}% success rate</div>
        </div>
    `;
}
