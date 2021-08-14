const config = require('config');
const { Client, Intents, Options, LimitedCollection } = require('discord.js');
const { logger } = require("./utility/logger");
const { loadGuilds, createGuild, deleteGuild } = require("./guild/guildmanager");
const { loadGiveaways } = require("./giveaway/giveawaymanager");
const { getGuild } = require("./guild/guildmanager");
const fs = require('fs');
const {loadCommands} = require("./utility/commandLoader");
const {deleteRole} = require("./guild/permissionmanager");


const bot = new Client({
    makeCache: Options.cacheWithLimits({
        MessageManager: 70,
        ThreadManager: {
            sweepInterval: 3600,
            sweepFilter: LimitedCollection.filterByLifetime({
              getComparisonTimestamp: e => e.archiveTimestamp,
              excludeFromSweep: e => !e.archived,
            })
        }
    }),
    retryLimit: 0,
    partials: ['MESSAGE', 'REACTION'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

//Initialization & Login
bot.login(config.get("token")).catch(err => {
    logger.error("Failed to login Bot on Discord:", err);
    process.exit(1);
});

async function init() {

    //Load bot commands
    try {
        bot.commands = await loadCommands(bot);
    } catch (err) {
        logger.error("Failed to load commands: ", err);
        process.exit(1);
    }

    //check if data directory exists or create a new one
    try {
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
            logger.info("No data directory found, creating a new one.");
        }
    } catch (err) {
        logger.error("Failed to create a new data directory:", err);
        process.exit(1);
    }

    try {
        loadGuilds();
    } catch (err) {
        logger.error("Failed to load guild data:", err);
        process.exit(1);
    }

    try {
        loadGiveaways();
    } catch (err) {
        logger.error("Failed to load giveaway data:", err);
        process.exit(1);
    }

    //Start Random Org API connection
    require("./utility/random");

}

//events
bot.once("ready", async () => {
    bot.user.setPresence({ 
        status: "online",
        activities: [
            {
                name: "Droid TV",
                type: "WATCHING"
            }
        ]
    });

    logger.info("Discord JS ready");

    await init();
});

bot.on("guildCreate", async (guild) => {
    createGuild(guild);
});

bot.on("guildDelete", async (guild) => {
    deleteGuild(guild);
});

bot.on("roleDelete", async (role) => {
    deleteRole(role);
});

bot.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	if (!bot.commands.has(interaction.commandName)) return;

    const storedGuild = getGuild(interaction.guild);
    const language = storedGuild.language;

	try {
		await bot.commands.get(interaction.commandName).execute({interaction, storedGuild, language});
	} catch (error) {
		logger.error("Failed to execute command: ", error);
		await interaction.reply({ content: "If you see this you somehow managed to break the bot quite badly. Could not execute command.", ephemeral: true });
	}
});

module.exports.bot = bot;