/**
 * General's Rank system based on cumulative score.
 */

const RANKS = [
    { threshold: 6001, name: 'General', emoji: '\uD83D\uDC51' },
    { threshold: 4501, name: 'Colonel', emoji: '\uD83C\uDF96' },
    { threshold: 3001, name: 'Captain', emoji: '\u2B50\u2B50\u2B50' },
    { threshold: 2001, name: 'Lieutenant', emoji: '\u2B50\u2B50' },
    { threshold: 1001, name: 'Sergeant', emoji: '\u2B50' },
    { threshold: 501, name: 'Corporal', emoji: '\u26A1' },
    { threshold: 0, name: 'Private', emoji: '\u2694' },
];

export function getRank(score) {
    for (const rank of RANKS) {
        if (score >= rank.threshold) return rank.name;
    }
    return 'Private';
}

export function getRankEmoji(rank) {
    const found = RANKS.find(r => r.name === rank);
    return found ? found.emoji : '\u2694';
}

export function getRankDisplay(score) {
    const name = getRank(score);
    const emoji = getRankEmoji(name);
    return { name, emoji, display: `${emoji} ${name}` };
}
