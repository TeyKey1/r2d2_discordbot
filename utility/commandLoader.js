const config = require("config");
const { logger } = require("../utility/logger");
const { Collection, REST, Routes } = require("discord.js");
const fs = require('fs');

const rest = new REST({ version: "9" }).setToken(config.get("token"));
const isProduction = process.env.NODE_ENV === "production" ? true : false;

async function loadCommands(bot) {
    var commands = new Collection();
    var apiCommandArray = [];

    const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands.set(command.data.name, command);
        apiCommandArray.push(command.data.toJSON());
    }

    await refreshCommands(apiCommandArray, bot);

    return commands;
}

async function refreshCommands(apiCommandArray, bot) {
    try {
        logger.info("Started reloading application (/) commands.");

        if (isProduction) {
            logger.info("Reloading global commands.");
            const res = await rest.put(
                Routes.applicationCommands(bot.application.id),
                { body: apiCommandArray },
            );
        } else {
            logger.info("Reloading guild commands.");
            await rest.put(
                Routes.applicationGuildCommands(bot.application.id, config.get("debugGuildId")),
                { body: apiCommandArray },
            );
        }

        logger.info("Successfully reloaded application (/) commands.");
    } catch (error) {
        logger.error("Failed to reload application commands", error);
    }
}

module.exports.loadCommands = loadCommands;