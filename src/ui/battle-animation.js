/**
 * "Fortune of War" battle animation overlay with dice rolling and progress bar.
 */
import { SoundEngine } from '../engine/sound-engine.js';

const DICE_FACES = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];
const BATTLE_DURATION = 3000; // ms
const TICK_INTERVAL = 100; // ms

/**
 * Show the dramatic battle animation, then call onComplete when done.
 * @param {object} params
 * @param {HTMLElement} params.overlay - The battle animation overlay element
 * @param {string} params.battleName - Name of the battle
 * @param {string} params.strategyName - Name of the chosen strategy
 * @param {number} params.winChance - Effective win chance (for display)
 * @param {boolean} params.won - Whether the player won
 * @param {function} params.onComplete - Callback when animation finishes
 */
export function showBattleAnimation({ overlay, battleName, strategyName, winChance, won, onComplete }) {
    const progressBar = document.getElementById('battleProgressBar');
    const die1 = document.getElementById('die1');
    const die2 = document.getElementById('die2');
    const fortuneResult = document.getElementById('fortuneResult');
    const fortuneChance = document.getElementById('fortuneChance');
    const animTitle = document.getElementById('battleAnimTitle');
    const animSubtitle = document.getElementById('battleAnimSubtitle');

    // Reset state
    animTitle.textContent = 'The Battle Rages...';
    animSubtitle.textContent = strategyName + ' at ' + battleName;
    progressBar.style.width = '0%';
    fortuneResult.className = 'fortune-result';
    fortuneResult.textContent = '';
    fortuneChance.textContent = '';
    die1.classList.add('rolling');
    die2.classList.add('rolling');

    overlay.classList.add('active');
    SoundEngine.playCannonBoom();

    let elapsed = 0;

    // Rolling dice animation
    const diceInterval = setInterval(() => {
        die1.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
        die2.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    }, 100);

    // Progress bar fill
    const progressInterval = setInterval(() => {
        elapsed += TICK_INTERVAL;
        const pct = Math.min((elapsed / BATTLE_DURATION) * 100, 100);
        progressBar.style.width = pct + '%';

        // Second cannon boom at halfway
        if (elapsed >= BATTLE_DURATION * 0.5 && elapsed < BATTLE_DURATION * 0.5 + TICK_INTERVAL) {
            SoundEngine.playCannonBoom();
        }

        if (elapsed >= BATTLE_DURATION) {
            clearInterval(progressInterval);
            clearInterval(diceInterval);

            // Show final dice (higher = win, lower = loss)
            const finalD1 = won ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 3);
            const finalD2 = won ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 3);
            die1.textContent = DICE_FACES[finalD1];
            die2.textContent = DICE_FACES[finalD2];
            die1.classList.remove('rolling');
            die2.classList.remove('rolling');

            // Screen flash
            const flash = document.createElement('div');
            flash.className = 'battle-flash';
            overlay.appendChild(flash);
            setTimeout(() => flash.remove(), 1500);

            // Reveal result
            setTimeout(() => {
                animTitle.textContent = 'Fortune of War';
                fortuneResult.textContent = won ? 'VICTORY!' : 'DEFEAT';
                fortuneResult.className = 'fortune-result reveal ' + (won ? 'win' : 'lose');
                fortuneChance.textContent = 'Win chance was ' + Math.round(winChance) + '%';

                if (won) SoundEngine.playVictoryFanfare();
                else SoundEngine.playDefeatDrum();

                // After reveal pause, close and proceed
                setTimeout(() => {
                    overlay.classList.remove('active');
                    if (onComplete) onComplete();
                }, 2000);
            }, 500);
        }
    }, TICK_INTERVAL);
}
