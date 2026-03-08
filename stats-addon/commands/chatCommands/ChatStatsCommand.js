import ChatCommand from '../../../../src/bot/commands/ChatCommand.js';
import { loadStats, formatStats } from '../../utils/StatsManager.js';

export default class ChatStatsCommand extends ChatCommand {
    constructor() {
        super('stats', '!stats <player> - View stats for a player', ['stat'], 3);
    }

    async execute(instance, username, args) {
        const target = args[1];

        if (!target) {
            instance.bot.whisper(username, 'Usage: !stats <player>');
            return;
        }

        const stats = loadStats();

        // Case-insensitive search
        const match = [...stats.entries()].find(([k]) => k.toLowerCase() === target.toLowerCase());
        if (!match) {
            instance.bot.whisper(username, `No stats found for ${target}.`);
            return;
        }

        instance.bot.whisper(username, formatStats(match[0], match[1]));
    }
}
