const {MessageEmbed} = require("discord.js");
const {checkPermission} = require("../guild/permissionmanager");
const {translate} = require("../utility/translate");
const {getGuild} = require("../guild/guildmanager");

module.exports = {
    slash: true,
    testOnly: true, 
    description: "Shows further info about this bot.", 
    category: 'Misc',
    guildOnly: true,
    callback: async ({guild, member}) => {
      
      const storedGuild = getGuild(guild);
      var embed = new MessageEmbed();
      
      if(! await checkPermission("admin", member, guild)){
        embed
        .setColor("#ff1100")
        .addField("** **", translate(storedGuild.language, "cmdPermissionError"));
        return embed;
      }

      embed
        .setColor("#eb4034")
        .setTitle("About R2D2 Discord Bot")
        .addField("Droid version:", `${process.pid}`)
        .addField("Developer", "TeyKey1")
        .addField("Version:", `${process.env.npm_package_version}`)
        .addField("Gitbhub:", "Unavailable");
      return embed;
    }
}