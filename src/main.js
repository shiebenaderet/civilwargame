/**
 * Civil War Battle Simulation v2.0.0 - Main Entry Point
 *
 * This file wires together all modules: data, engine, and UI.
 */

// CSS imports (Vite bundles these)
import './styles/tokens.css';
import './styles/animations.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/battle.css';
import './styles/responsive.css';
import './styles/print.css';

// Data
import { battles } from './data/battles.js';
import { leaderMessages } from './data/leaders.js';
import { assetManifest } from './data/assets.js';
import { createBattleMap } from './data/maps.js';

// Engine
import { SoundEngine } from './engine/sound-engine.js';
import { createInitialState, saveGame, loadGame, clearSave } from './engine/game-state.js';
import { calculateEffectiveWinChance, rollBattle, applyBattleResult, shouldEndGame, checkVictory } from './engine/battle-engine.js';
import { getRank, getRankEmoji } from './engine/rank-system.js';

// UI
import { setElements, getElements, hideAllScreens, showScreen, toggleVisualMode } from './ui/screens.js';
import { showBattleAnimation } from './ui/battle-animation.js';
import { showCampaignLog, closeCampaignLog } from './ui/campaign-log.js';
import { toggleSettingsMenu, toggleVocabularyHelp, updateVocabularyDisplay } from './ui/settings.js';
import { updateGameDisplay } from './ui/navbar.js';

// ===============================================
// GAME STATE
// ===============================================
let gameState = createInitialState();

// ===============================================
// INITIALIZATION
// ===============================================
function initializeGame() {
    // Gather all DOM element references
    setElements({
        sideSelection: document.getElementById('sideSelection'),
        sideIntroduction: document.getElementById('sideIntroduction'),
        battleBriefing: document.getElementById('battleBriefing'),
        gameScreen: document.getElementById('gameScreen'),
        battleResultsModal: document.getElementById('battleResultsModal'),
        campaignLogModal: document.getElementById('campaignLogModal'),
        endGameSummary: document.getElementById('endGameSummary'),
        unionCard: document.getElementById('unionCard'),
        confederacyCard: document.getElementById('confederacyCard'),
        proceedToGame: document.getElementById('proceedToGame'),
        backToSideBtn: document.getElementById('backToSideBtn'),
        continueBattleBtn: document.getElementById('continueBattleBtn'),
        closeLogBtn: document.getElementById('closeLogBtn'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        photoToggle: document.getElementById('photoToggle'),
        mapToggle: document.getElementById('mapToggle'),
        briefingImage: document.getElementById('briefingImage'),
        briefingMap: document.getElementById('briefingMap'),
        navbarStats: document.getElementById('navbarStats'),
        navScore: document.getElementById('navScore'),
        navSoldiers: document.getElementById('navSoldiers'),
        navBattleNumber: document.getElementById('navBattleNumber'),
        navWins: document.getElementById('navWins'),
        navRank: document.getElementById('navRank'),
        campaignLogNavBtn: document.getElementById('campaignLogNavBtn'),
        startOverNavBtn: document.getElementById('startOverNavBtn'),
        vocabToggleNav: document.getElementById('vocabToggleNav'),
        settingsBtn: document.getElementById('settingsBtn'),
        settingsMenu: document.getElementById('settingsMenu'),
        vocabStatus: document.getElementById('vocabStatus'),
        muteBtn: document.getElementById('muteBtn'),
        resumeSection: document.getElementById('resumeSection'),
        resumeBtn: document.getElementById('resumeBtn'),
        resumeDiscard: document.getElementById('resumeDiscard'),
        resumeInfo: document.getElementById('resumeInfo'),
        battleAnimOverlay: document.getElementById('battleAnimOverlay'),
    });

    const elements = getElements();

    // Initialize sound engine
    SoundEngine.init();
    if (localStorage.getItem('cwgMuted') === '1') {
        SoundEngine.muted = true;
        if (elements.muteBtn) elements.muteBtn.innerHTML = '\uD83D\uDD07';
    }

    // Check for saved game
    const saved = loadGame();
    if (saved && saved.side && saved.currentBattle > 0) {
        elements.resumeSection.style.display = 'block';
        elements.resumeInfo.textContent =
            'Battle ' + (saved.currentBattle + 1) + '/10 - ' +
            (saved.side === 'union' ? 'Union' : 'Confederacy') +
            ' - Score: ' + saved.score.toLocaleString();
    }

    // Check if intro has been seen
    const hasSeenIntro = localStorage.getItem('civilWarIntroSeen');
    hideAllScreens();
    elements.sideSelection.style.display = 'block';
    if (!hasSeenIntro) {
        document.getElementById('civilWarIntro').style.display = 'block';
        document.querySelector('.sides-container').style.display = 'none';
        if (elements.resumeSection) elements.resumeSection.style.display = 'none';
        setTimeout(() => updateVocabularyDisplay(), 150);
    }

    setupEventListeners();
    updateVocabularyDisplay();
}

// ===============================================
// EVENT LISTENERS
// ===============================================
function setupEventListeners() {
    const elements = getElements();

    // Side selection
    elements.unionCard.addEventListener('click', () => { SoundEngine.playClick(); selectSide('union'); });
    elements.confederacyCard.addEventListener('click', () => { SoundEngine.playClick(); selectSide('confederacy'); });
    elements.unionCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SoundEngine.playClick(); selectSide('union'); } });
    elements.confederacyCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SoundEngine.playClick(); selectSide('confederacy'); } });

    const unionBtn = elements.unionCard.querySelector('.select-strategy-btn');
    const confBtn = elements.confederacyCard.querySelector('.select-strategy-btn');
    if (unionBtn) unionBtn.addEventListener('click', (e) => { e.stopPropagation(); SoundEngine.playClick(); selectSide('union'); });
    if (confBtn) confBtn.addEventListener('click', (e) => { e.stopPropagation(); SoundEngine.playClick(); selectSide('confederacy'); });

    // Navigation
    elements.proceedToGame.addEventListener('click', () => { SoundEngine.playClick(); startFirstBattle(); });
    elements.backToSideBtn.addEventListener('click', () => { SoundEngine.playClick(); showSideSelection(); });
    elements.continueBattleBtn.addEventListener('click', () => { SoundEngine.playClick(); continueToNextBattle(); });
    elements.playAgainBtn.addEventListener('click', () => { SoundEngine.playClick(); resetGame(); });
    elements.closeLogBtn.addEventListener('click', () => closeCampaignLog());
    elements.campaignLogNavBtn.addEventListener('click', () => showCampaignLog(gameState));
    elements.startOverNavBtn.addEventListener('click', () => { if (confirm('Are you sure you want to start over?')) resetGame(); });
    elements.vocabToggleNav.addEventListener('click', () => toggleVocabularyHelp(elements));
    elements.settingsBtn.addEventListener('click', () => toggleSettingsMenu(elements));
    elements.muteBtn.addEventListener('click', () => SoundEngine.toggleMute());

    // Resume
    if (elements.resumeBtn) elements.resumeBtn.addEventListener('click', resumeGame);
    if (elements.resumeDiscard) elements.resumeDiscard.addEventListener('click', () => { clearSave(); elements.resumeSection.style.display = 'none'; });

    // Visual toggles
    elements.photoToggle.addEventListener('click', () => toggleVisualMode('photo'));
    elements.mapToggle.addEventListener('click', () => toggleVisualMode('map'));

    // Keyboard: Escape closes modals/menus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.campaignLogModal.style.display !== 'none') closeCampaignLog();
            if (elements.settingsMenu.classList.contains('show')) {
                elements.settingsMenu.classList.remove('show');
                elements.settingsBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.settingsMenu.classList.contains('show') &&
            !elements.settingsMenu.contains(e.target) &&
            !elements.settingsBtn.contains(e.target)) {
            elements.settingsMenu.classList.remove('show');
            elements.settingsBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ===============================================
// GAME FLOW
// ===============================================
function selectSide(side) {
    gameState.side = side;
    const leader = leaderMessages[side];
    document.getElementById('leaderPortrait').textContent = leader.portrait;
    document.getElementById('leaderName').textContent = leader.name;
    document.getElementById('leaderMessage').innerHTML = leader.message;

    const objectivesList = document.getElementById('objectivesList');
    objectivesList.innerHTML = '';
    leader.objectives.forEach(objective => {
        const item = document.createElement('div');
        item.className = 'objective-item';
        item.textContent = objective;
        objectivesList.appendChild(item);
    });

    showSideIntroduction();
}

function showSideSelection() {
    gameState.side = null;
    const elements = getElements();
    hideAllScreens();
    elements.sideSelection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSideIntroduction() {
    const elements = getElements();
    hideAllScreens();
    elements.sideIntroduction.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startFirstBattle() {
    gameState.soldiers = gameState.side === 'union' ? 1500000 : 1000000;
    gameState.currentBattle = 0;
    gameState.score = 0;
    gameState.wins = 0;
    gameState.losses = 0;
    gameState.battleHistory = [];
    gameState.morale = 0;
    gameState.consecutiveWins = 0;
    gameState.consecutiveLosses = 0;
    showBattleBriefing();
}

function resumeGame() {
    const saved = loadGame();
    if (saved) {
        gameState = saved;
        showBattleBriefing();
    }
}

function showBattleBriefing() {
    const elements = getElements();
    const battle = battles[gameState.currentBattle];
    const battleAsset = assetManifest[gameState.currentBattle] || assetManifest[0];

    document.getElementById('briefingTitle').textContent = battle.name;
    document.getElementById('briefingDate').textContent = battle.date;
    document.getElementById('contextText').innerHTML = battle.context;

    // Battle image
    if (battleAsset && elements.briefingImage) {
        elements.briefingImage.innerHTML =
            '<img src="' + battleAsset.url + '" alt="' + battleAsset.title +
            '" loading="lazy" decoding="async" style="transition:opacity 0.3s;width:100%;height:100%;object-fit:cover;" ' +
            'onload="this.style.opacity=\'1\'" ' +
            'onerror="this.onerror=null;this.parentElement.innerHTML=\'<div style=\\\'text-align:center;padding:40px;color:var(--color-text-secondary)\\\'>\u2694 ' +
            battle.name + '</div>\'">' +
            '<span class="image-credit" style="position:absolute;bottom:8px;left:8px;right:8px;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;border-radius:4px;font-size:0.8em;">' +
            battleAsset.credit + ' - ' + battleAsset.source + '</span>';
    } else {
        elements.briefingImage.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-text-secondary);"><div style="font-size:3em;">\u2694</div><p>' + battle.name + '</p></div>';
    }

    // Battle map
    const battleId = battleAsset ? battleAsset.id : 'generic';
    elements.briefingMap.innerHTML = createBattleMap(battleId);
    toggleVisualMode('photo');

    // Strategy choices
    const choicesList = document.getElementById('choicesList');
    choicesList.innerHTML = '';
    battle.strategies.forEach((strategy, index) => {
        const sideData = strategy[gameState.side];
        const effectiveWinChance = calculateEffectiveWinChance(sideData.winChance, gameState);
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice-option ' + (index === 0 ? 'aggressive' : index === 1 ? 'defensive' : 'tactical');
        const barColor = effectiveWinChance >= 60 ? '#10b981' : effectiveWinChance >= 40 ? '#f59e0b' : '#ef4444';

        choiceDiv.innerHTML =
            '<div class="choice-header"><div class="choice-name">' + strategy.name + '</div><div class="expand-icon">\u25BC</div></div>' +
            '<div class="choice-description">' + strategy.description + '</div>' +
            '<div class="choice-details">' +
            '<div class="choice-explanation">' + strategy.explanation + '</div>' +
            '<div class="choice-pros-cons"><div class="pros"><div class="pros-title">\u2713 Advantages:</div><ul>' +
            strategy.pros.map(p => '<li>' + p + '</li>').join('') +
            '</ul></div><div class="cons"><div class="cons-title">\u2717 Risks:</div><ul>' +
            strategy.cons.map(c => '<li>' + c + '</li>').join('') +
            '</ul></div></div>' +
            '<div class="win-chance-display">Win Chance: <strong>' + Math.round(effectiveWinChance) + '%</strong>' +
            (gameState.morale !== 0
                ? ' <span style="color:' + (gameState.morale > 0 ? '#10b981' : '#ef4444') + '">(' + (gameState.morale > 0 ? '+' : '') + gameState.morale + '% morale)</span>'
                : '') +
            '<div class="win-chance-bar"><div class="win-chance-fill" style="width:' + effectiveWinChance + '%;background:' + barColor + '"></div></div></div>' +
            '</div>';

        choiceDiv.addEventListener('click', () => {
            const isExpanded = choiceDiv.classList.contains('expanded');
            if (!isExpanded) {
                document.querySelectorAll('.choice-option').forEach(o => o.classList.remove('expanded'));
                choiceDiv.classList.add('expanded');
                SoundEngine.playClick();
            } else {
                SoundEngine.playClick();
                makeDecision(index);
            }
        });

        choicesList.appendChild(choiceDiv);
    });

    // Instruction text
    const instructionDiv = document.createElement('div');
    instructionDiv.className = 'click-to-expand';
    instructionDiv.innerHTML = '\uD83D\uDCA1 <strong>How it works:</strong> First click = see details \u2022 Second click = make decision';
    choicesList.appendChild(instructionDiv);

    hideAllScreens();
    elements.battleBriefing.style.display = 'block';
    updateGameDisplay(gameState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateVocabularyDisplay();
}

function makeDecision(strategyIndex) {
    const battle = battles[gameState.currentBattle];
    const strategy = battle.strategies[strategyIndex];
    const sideData = strategy[gameState.side];
    const effectiveWinChance = calculateEffectiveWinChance(sideData.winChance, gameState);
    const won = rollBattle(effectiveWinChance);

    showBattleAnimation({
        overlay: getElements().battleAnimOverlay,
        battleName: battle.name,
        strategyName: strategy.name,
        winChance: effectiveWinChance,
        won: won,
        onComplete: () => {
            const result = applyBattleResult(gameState, battle, strategy, sideData, won);
            saveGame(gameState);
            showBattleResults(won, result.actualLoss, result.actualScore, strategy);
        }
    });
}

function showBattleResults(won, casualties, scoreGained, strategy) {
    const elements = getElements();
    const battle = battles[gameState.currentBattle];

    const outcomeEl = document.getElementById('battleOutcome');
    outcomeEl.textContent = won ? 'VICTORY!' : 'DEFEAT';
    outcomeEl.className = won ? 'battle-outcome battle-victory' : 'battle-outcome battle-defeat';

    document.getElementById('resultIcon').textContent = won ? '\uD83C\uDFC6' : '\uD83D\uDC80';
    document.getElementById('resultText').textContent = won ? 'Your strategy succeeded!' : 'Your strategy was defeated.';
    document.getElementById('casualtiesSummary').textContent = casualties.toLocaleString() + ' lost';
    document.getElementById('scoreSummary').textContent = '+' + scoreGained + ' points';
    document.getElementById('armySummary').textContent = gameState.soldiers.toLocaleString() + ' remain';

    const sideResult = gameState.side === 'union'
        ? (won ? 'union_win' : 'union_loss')
        : (won ? 'confederacy_win' : 'confederacy_loss');

    const outcomeHighlight = won
        ? '<span class="outcome-highlight victory-highlight">\uD83C\uDF89 YOU WON THIS BATTLE! \uD83C\uDF89</span>'
        : '<span class="outcome-highlight defeat-highlight">\uD83D\uDC94 You lost this battle \uD83D\uDC94</span>';

    document.getElementById('explanationText').innerHTML =
        '<div style="text-align: center; margin-bottom: 20px;">' + outcomeHighlight + '</div>' +
        '<p><strong>Your Strategy:</strong> ' + strategy.name + '</p>' +
        '<p><strong>What Happened:</strong> ' + (battle.results[sideResult] || 'The battle outcome was determined by your strategic choice.') + '</p>' +
        '<p style="margin-top: 15px;"><strong>Why this happened:</strong> ' + strategy.explanation.replace(/<[^>]*>/g, '') + '</p>';

    document.getElementById('historicalNote').textContent = battle.historical_notes.general;

    if (gameState.currentBattle + 1 >= battles.length || gameState.soldiers <= 0) {
        elements.continueBattleBtn.textContent = 'View Final Results';
    } else {
        elements.continueBattleBtn.textContent = 'Continue to Next Battle';
    }

    updateGameDisplay(gameState);
    hideAllScreens();
    elements.gameScreen.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function continueToNextBattle() {
    gameState.currentBattle++;
    if (gameState.currentBattle >= battles.length || gameState.soldiers <= 0 || shouldEndGame(gameState, battles.length)) {
        endGame();
    } else {
        showBattleBriefing();
    }
}

function endGame() {
    clearSave();
    const victory = checkVictory(gameState);
    showEndGameSummary(victory);
}

function showEndGameSummary(victory) {
    const elements = getElements();
    hideAllScreens();

    const banner = document.getElementById('outcomeBanner');
    banner.className = victory ? 'outcome-banner victory-banner' : 'outcome-banner defeat-banner';

    document.getElementById('outcomeTitle').textContent = victory ? 'VICTORY!' : 'DEFEAT';
    document.getElementById('outcomeSubtitle').textContent = victory
        ? (gameState.side === 'union' ? 'The Union is Preserved' : 'Confederate Independence Achieved')
        : (gameState.side === 'union' ? 'The Rebellion Continues' : 'The Confederacy Falls');

    const startingSoldiers = gameState.side === 'union' ? 1500000 : 1000000;
    const casualtyRate = Math.round(((startingSoldiers - gameState.soldiers) / startingSoldiers) * 100);
    const rank = getRank(gameState.score);
    const rankEmoji = getRankEmoji(rank);

    document.getElementById('finalStatsText').innerHTML =
        '<div style="text-align: left; max-width: 600px; margin: 0 auto;">' +
        '<div class="rank-badge">' + rankEmoji + ' Final Rank: ' + rank + '</div>' +
        '<h3 style="color: #ffd700; margin-bottom: 15px;">Your Performance:</h3>' +
        '<p><strong>Final Score:</strong> ' + gameState.score.toLocaleString() + ' points</p>' +
        '<p><strong>Battles Won:</strong> ' + gameState.wins + ' out of ' + gameState.currentBattle + ' fought</p>' +
        '<p><strong>Soldiers Lost:</strong> ' + (startingSoldiers - gameState.soldiers).toLocaleString() + ' (' + casualtyRate + '% casualty rate)</p>' +
        '<p><strong>Side:</strong> ' + (gameState.side === 'union' ? '\uD83C\uDDFA\uD83C\uDDF8 Union' : '\uD83C\uDFF4 Confederacy') + '</p>' +
        '<h3 style="color: #ffd700; margin: 20px 0 10px 0;">What You Learned:</h3>' +
        '<p>You experienced the same difficult decisions that real Civil War commanders faced. Each battle presented unique challenges based on terrain, troop positions, and available resources.</p>' +
        '<p style="margin-top: 15px;">' +
        (victory
            ? 'Congratulations! Your strategic decisions led to victory. In the real Civil War, these battles helped determine the future of the United States.'
            : 'Although you didn\'t achieve victory, you learned about the challenges of Civil War command. Every battle taught lessons that real generals had to learn the hard way.') +
        '</p>' +
        '<h3 style="color: #ffd700; margin: 20px 0 10px 0;">Battle Summary:</h3>' +
        '<div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">' +
        gameState.battleHistory.map(b =>
            '<div style="margin: 5px 0; padding: 5px; border-left: 3px solid ' + (b.result === 'Victory' ? '#10b981' : '#dc2626') + ';">' +
            '<strong>' + b.name + ':</strong> ' + (b.result === 'Victory' ? '\u2705' : '\u274C') + ' ' + b.result +
            ' (' + b.strategy + ', ' + b.casualties.toLocaleString() + ' casualties)</div>'
        ).join('') +
        '</div></div>';

    elements.endGameSummary.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetGame() {
    clearSave();
    gameState = createInitialState();
    showSideSelection();
}

// ===============================================
// INTRO HELPER (called from HTML onclick)
// ===============================================
window.hideIntroduction = function () {
    localStorage.setItem('civilWarIntroSeen', 'true');
    document.getElementById('civilWarIntro').style.display = 'none';
    document.querySelector('.sides-container').style.display = 'flex';
    const elements = getElements();
    if (elements.resumeSection && loadGame()) {
        elements.resumeSection.style.display = 'block';
    }
    updateVocabularyDisplay();
};

// Theme functions (need to be global for HTML onclick)
window.toggleTheme = function () {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('.theme-icon');
        const text = toggleBtn.querySelector('.theme-text');
        if (icon) icon.textContent = newTheme === 'light' ? '\u263D' : '\u2600';
        if (text) text.textContent = newTheme === 'light' ? 'Dark Theme' : 'Light Theme';
        toggleBtn.setAttribute('aria-label', 'Switch to ' + (newTheme === 'light' ? 'dark' : 'light') + ' theme');
    }
};

window.initializeTheme = function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('.theme-icon');
        const text = toggleBtn.querySelector('.theme-text');
        if (icon) icon.textContent = savedTheme === 'light' ? '\u263D' : '\u2600';
        if (text) text.textContent = savedTheme === 'light' ? 'Dark Theme' : 'Light Theme';
        toggleBtn.setAttribute('aria-label', 'Switch to ' + (savedTheme === 'light' ? 'dark' : 'light') + ' theme');
    }
};

// Google Translate helpers (need to be global)
window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'es,fr,pt,zh,ko,uk,ja,ru,ar',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

window.translateWithGoogle = function (targetLanguage) {
    const codes = { 'Spanish': 'es', 'French': 'fr', 'Portuguese': 'pt', 'Chinese': 'zh', 'Korean': 'ko', 'Ukrainian': 'uk', 'Japanese': 'ja', 'Russian': 'ru', 'Arabic': 'ar' };
    const langCode = codes[targetLanguage] || 'en';
    document.documentElement.setAttribute('lang', langCode);
    if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
            setTimeout(() => {
                const select = document.querySelector('.goog-te-combo');
                if (select) { select.value = langCode; select.dispatchEvent(new Event('change')); }
            }, 1000);
        };
    } else {
        const select = document.querySelector('.goog-te-combo');
        if (select) { select.value = langCode; select.dispatchEvent(new Event('change')); }
    }
};

// ===============================================
// BOOT
// ===============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
