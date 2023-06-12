const config = require('config');
const { Client, IntentsBitField, Options, Partials } = require('discord.js');
const { logger } = require("./utility/logger");
const { loadGuilds, createGuild, deleteGuild } = require("./guild/guildmanager");
const { loadGiveaways } = require("./giveaway/giveawaymanager");
const { loadReminders } = require("./reminder/remindermanager");
const { getGuild } = require("./guild/guildmanager");
const fs = require('fs');
const { loadCommands } = require("./utility/commandLoader");
const { deleteRole } = require("./guild/permissionmanager");
const { scheduleGiveaways, scheduleReminders } = require("./utility/scheduler");


const bot = new Client({
    makeCache: Options.cacheWithLimits({
        MessageManager: 50,
        UserManager: 100,
    }),
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 3600,
            lifetime: 1800,
        },
        users: {
            interval: 3600,
            filter: () => user => user.bot && user.id !== client.user.id, // Remove all bots.
        },
    },
    retryLimit: 0,
    partials: [Partials.Message, Partials.Reaction],
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMessageReactions]
});

//Initialization & Login
bot.login(config.get("token")).catch(err => {
    logger.error("Failed to login Bot on Discord:", err);
    process.exit(1);
});

async function init() {

    logger.info("Initializing app. Environment: " + process.env.NODE_ENV);

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

    try {
        loadReminders();
    } catch (err) {
        logger.error("Failed to load reminder data:", err);
        process.exit(1);
    }

    //Start Random Org API connection
    require("./utility/random");

    //Start giveaway scheduler
    scheduleGiveaways(bot);

    //Start reminder scheduler
    scheduleReminders(bot);

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

    if (!interaction.inGuild()) return;

    const storedGuild = getGuild(interaction.guild);
    const language = storedGuild.language;

    try {
        await bot.commands.get(interaction.commandName).execute({ interaction, storedGuild, language });
    } catch (error) {
        logger.error("Failed to execute command: ", error);
        await interaction.reply({ content: "If you see this you somehow managed to break the bot quite badly. Could not execute command.", ephemeral: true });
    }
});

process.on('unhandledRejection', function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});

// Monkey patch bigint to be serializable
BigInt.prototype.toJSON = function () { return this.toString() };