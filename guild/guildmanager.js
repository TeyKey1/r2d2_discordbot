const {readDataSync, saveData} = require("../utility/dataHandler");
var guilds = new Map();

function loadGuilds (){
    guilds = readDataSync();
}

function saveGuilds(){
    saveData(guilds);
}

function deleteGuild(guild){
    guilds.delete(guild.id);

    saveData(guilds);
}

function createGuild(guild){
    const existing = exists(guild);

    if(existing){
        //Flush rotationChannelData
        existing.rotationChannelData.splice(0, existing.rotationChannelData.length);

        saveData(guilds);
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

    saveData(guilds);

    return guildData;
}


module.exports.loadGuilds = loadGuilds;
module.exports.saveGuilds = saveGuilds;
module.exports.createGuild = createGuild;
module.exports.deleteGuild = deleteGuild;