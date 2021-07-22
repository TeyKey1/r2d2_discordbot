const { MessageEmbed } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");
const { getGuild, modifyGuild } = require("../guild/guildmanager");

module.exports = {
    slash: true,
    testOnly: true,
    description: "Sets the user roles which are allowed to use all commands with permission level user.",
    category: 'Configuration',
    guildOnly: true,
    minArgs: 1,
    expectedArgs: '<role>',
    callback: async ({ guild, member, args }) => {
        console.log("calling");

        var [role] = args;

        var storedGuild = getGuild(guild);

        var embed = new MessageEmbed();

        if (! await checkPermission("admin", member, guild)) {
            embed
                .setColor("#ff1100")
                .addField("** **", translate(storedGuild.language, "cmdPermissionError"));
            return embed;
        }

        console.log(role);
        //const valid = guild.roles.resolve(role);
        //console.log(valid);


        modifyGuild(storedGuild);

            embed
                .setColor("#0aa12d")
                .addField("** **", translate(storedGuild.language, "cmdChangeLanguage"));
        return embed;
    }
}