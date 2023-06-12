const { readDataSync, saveData } = require("../utility/dataHandler");
const filePath = "./data/servers.json";
let guilds = new Map();

function loadGuilds() {
    guilds = readDataSync(filePath);
}

function modifyGuild(guild) {
    guilds.set(guild.guildId, guild);
    saveData(guilds, filePath);
    return guild;
}

function deleteGuild(guild) {
    guilds.delete(guild.id);

    saveData(guilds, filePath);
}

function createGuild(guild) {
    const existing = exists(guild);

    if (existing) {
        saveData(guilds, filePath);
        return existing;
    }

    const guildData = {
        name: guild.name,
        guildId: guild.id,
        modLogChannel: "",
        language: "en",
        adminRoles: [],
        userRoles: []
    };


    guilds.set(guild.id, guildData);

    saveData(guilds, filePath);

    return guildData;
}

function getGuild(guild) {
    let storedGuild = guilds.get(guild.id);

    //Create guild if not existing in DB
    if (!storedGuild) {
        storedGuild = createGuild(guild);
    }

    return storedGuild;
}

function getGuildById(guildId) {
    let storedGuild = guilds.get(guildId);

    //Create guild if not existing in DB
    if (!storedGuild) {
        throw new Error("Guild does not exist in Database");
    }

    return storedGuild;
}

/*
* Check if Guild exists in Database. Returns the guild data if it exists
*/
function exists(guild) {
    let guildData = undefined;

    if (guilds.has(guild.id)) {
        guildData = guilds.get(guild.id);
    }

    return guildData;
}


module.exports.loadGuilds = loadGuilds;
module.exports.modifyGuild = modifyGuild;
module.exports.createGuild = createGuild;
module.exports.deleteGuild = deleteGuild;
module.exports.getGuild = getGuild;
module.exports.getGuildById = getGuildById;