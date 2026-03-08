import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATS_FILE = path.resolve(__dirname, '../stats.txt');

/**
 * Load all stats from stats.txt
 * Format per line: username|kills|deaths|damage_dealt|damage_taken
 * @returns {Map<string, Object>}
 */
export function loadStats() {
    const map = new Map();

    if (!fs.existsSync(STATS_FILE)) return map;

    const lines = fs.readFileSync(STATS_FILE, 'utf8').split('\n').filter(l => l.trim());
    for (const line of lines) {
        const [username, kills, deaths, damageDealt, damageTaken] = line.split('|');
        if (!username) continue;
        map.set(username, {
            kills: parseInt(kills) || 0,
            deaths: parseInt(deaths) || 0,
            damageDealt: parseFloat(damageDealt) || 0,
            damageTaken: parseFloat(damageTaken) || 0,
        });
    }

    return map;
}

/**
 * Save all stats to stats.txt
 * @param {Map<string, Object>} map
 */
export function saveStats(map) {
    const lines = [];
    for (const [username, s] of map.entries()) {
        lines.push(`${username}|${s.kills}|${s.deaths}|${s.damageDealt.toFixed(1)}|${s.damageTaken.toFixed(1)}`);
    }
    fs.writeFileSync(STATS_FILE, lines.join('\n') + '\n', 'utf8');
}

/**
 * Get or create stats entry for a player
 * @param {Map} map
 * @param {string} username
 */
export function getOrCreate(map, username) {
    if (!map.has(username)) {
        map.set(username, { kills: 0, deaths: 0, damageDealt: 0, damageTaken: 0 });
    }
    return map.get(username);
}

/**
 * Format stats for a player into a readable string
 */
export function formatStats(username, s) {
    if (!s) return `No stats found for ${username}.`;
    return `Stats for ${username}: Kills: ${s.kills} | Deaths: ${s.deaths} | Dmg dealt: ${s.damageDealt.toFixed(1)} | Dmg taken: ${s.damageTaken.toFixed(1)}`;
}
