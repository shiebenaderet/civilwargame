/**
 * Game state management with localStorage persistence.
 */

const SAVE_KEY = 'cwgSave';

export function createInitialState() {
    return {
        side: null,
        currentBattle: 0,
        score: 0,
        soldiers: 0,
        wins: 0,
        losses: 0,
        battleHistory: [],
        morale: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0
    };
}

export function saveGame(gameState) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
        // localStorage not available
    }
}

export function loadGame() {
    try {
        const s = localStorage.getItem(SAVE_KEY);
        if (s) {
            const state = JSON.parse(s);
            // Ensure newer fields exist for backward compatibility
            if (state.morale === undefined) state.morale = 0;
            if (state.consecutiveWins === undefined) state.consecutiveWins = 0;
            if (state.consecutiveLosses === undefined) state.consecutiveLosses = 0;
            return state;
        }
    } catch (e) {
        // corrupted save
    }
    return null;
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}

export function hasSavedGame() {
    return !!localStorage.getItem(SAVE_KEY);
}
