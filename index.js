const config = require('config');
const {Client} = require('discord.js');
const {logger} = require("./utility/logger");
const {loadGuilds, createGuild, deleteGuild} = require("./guild/guildmanager");
const WOKCommands = require('wokcommands')
const fs = require('fs');


const bot = new Client({
    messageCacheMaxSize: 100, 
    messageCacheLifetime:	43200, 
    messageSweepInterval: 3600,
    messageEditHistoryMaxSize: 0,
    fetchAllMembers: false,
    retryLimit: 0,
    partials: ['MESSAGE', 'REACTION']
});


//Initialization & Login
bot.login(config.get("token")).catch(err =>{
    logger.error("Failed to login Bot on Discord:", err);
    process.exit(1);
});


function init(){
    //check if data directory exists or create a new one
    try {
        if(!fs.existsSync("./data")){
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

    //Start Random Org API connection
    require("./utility/random");

}

//events
bot.on("ready", async ()=>{
    bot.user.setPresence({
        status: "online", 
        activity: {
            name: "Droid TV",
            type: "WATCHING",
        }
    });

    new WOKCommands(bot, {
        commandsDir: "commands",
        testServers: [config.get("testServerId")]
    }).setCategorySettings([
        {
            name: 'Fun & Games',
            emoji: '🎮'
        },
        {
            name: 'Economy',
            emoji: '💸'
        },
        {
            // You can change the default emojis as well
            // "Configuration" is ⚙ by default
            name: 'Configuration',
            emoji: '🚧',
            // You can also hide a category from the help menu
            // Admins bypass this
            hidden: true
        },
    ])

    logger.info("Discord JS ready");

    init();
});

bot.on("guildCreate", async(guild)=>{
    createGuild(guild);
});

bot.on("guildDelete", async(guild)=>{
    deleteGuild(guild);
});