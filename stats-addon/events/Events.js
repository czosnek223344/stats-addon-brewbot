import { saveStats, getOrCreate } from '../utils/StatsManager.js';

/**
 * @param {Object} i - Bot wrapper
 * @param {Map} stats - shared stats map
 */
export default function initStatsEvents(i, stats) {

    // ── Damage tracking ─────────────────────────────────────
    i.bot._client.on('packet', (data, metadata) => {
        if (metadata.name !== 'damage_event') return;

        const attacker = i.bot.entities[data.sourceCauseId - 1];
        const target = i.bot.entities[data.entityId];

        if (!target || target.type !== 'player') return;

        const attackerName = attacker?.username;
        const targetName = target?.username;

        // Rough damage estimate from health (mineflayer doesn't give exact damage in packet)
        // We use 1.0 as a hit counter since actual damage isn't in this packet
        const dmgAmount = 1.0;

        if (attackerName && attackerName !== i.bot.username) {
            const s = getOrCreate(stats, attackerName);
            s.damageDealt += dmgAmount;
        }

        if (targetName && targetName !== i.bot.username) {
            const s = getOrCreate(stats, targetName);
            s.damageTaken += dmgAmount;
        }

        saveStats(stats);
    });

    // ── Kill detection via chat (most reliable cross-server method) ──
    // Listens for death messages like "Steve was killed by 4Fix"
    i.bot.on('messagestr', (message) => {
        // Common vanilla death message patterns involving "killed by" or "slain by"
        const killedBy = message.match(/^(\S+) (?:was killed|was slain|got finished off) by (\S+)/i);
        if (killedBy) {
            const dead = killedBy[1];
            const killer = killedBy[2];

            const killerStats = getOrCreate(stats, killer);
            killerStats.kills += 1;

            const deadStats = getOrCreate(stats, dead);
            deadStats.deaths += 1;

            saveStats(stats);
            i.logger.info(`[StatsAddon] Kill: ${killer} killed ${dead}`);
            return;
        }

        // "Steve died" / "Steve drowned" etc — count as death with no killer
        const died = message.match(/^(\S+) (?:died|drowned|burned|fell|starved|suffocated|was blown up|hit the ground|went up in flames)/i);
        if (died) {
            const dead = died[1];
            const deadStats = getOrCreate(stats, dead);
            deadStats.deaths += 1;
            saveStats(stats);
            i.logger.info(`[StatsAddon] Death: ${dead}`);
        }
    });

    i.logger.info('[StatsAddon] Events loaded — tracking kills, deaths, damage.');
}
