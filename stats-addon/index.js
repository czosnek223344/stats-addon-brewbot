import BrewBotAddon from '../../src/addon/BrewBotAddon.js';
import { chatCommands } from '../../src/index.js';
import ChatStatsCommand from './commands/chatCommands/ChatStatsCommand.js';
import initStatsEvents from './events/Events.js';
import { loadStats } from './utils/StatsManager.js';

export default class StatsAddon extends BrewBotAddon {
    constructor() {
        super();
        this.name = 'StatsAddon';
        this.chatCommands = chatCommands;
        this.eventHandlers = [];
        // Single shared stats map — loaded once, updated in memory, saved to file
        this.stats = loadStats();
    }

    initialize(logger, bot = null) {
        super.initialize(logger, bot);

        // Register !stats command
        this.chatCommands.register(new ChatStatsCommand());

        if (this.bot) this.registerEvents();
    }

    registerEvents() {
        initStatsEvents(this.bot, this.stats);
    }
}
