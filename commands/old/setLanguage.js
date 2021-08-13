const { MessageEmbed } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate, getLanguages } = require("../utility/translate");
const { getGuild, modifyGuild } = require("../guild/guildmanager");

module.exports = {
    slash: true,
    testOnly: true,
    description: "Sets the language of this bot.",
    category: 'Configuration',
    guildOnly: true,
    minArgs: 1,
    expectedArgs: '<language>',
    callback: async ({ guild, member, args }) => {

        var [language] = args;

        var storedGuild = getGuild(guild);

        var embed = new MessageEmbed();

        if (! await checkPermission("admin", member, guild)) {
            embed
                .setColor("#ff1100")
                .addField("** **", translate(storedGuild.language, "cmdPermissionError"));
            return embed;
        }

        language = getLanguages(language);

        if(Array.isArray(language)){
            embed
                .setColor("#ff1100")
                .addField("** **", translate(storedGuild.language, "cmdChangeLanguageError") + `${language.join(", ")}`);
            return embed;
        }

        storedGuild.language = language;

        modifyGuild(storedGuild);

            embed
                .setColor("#0aa12d")
                .addField("** **", translate(storedGuild.language, "cmdChangeLanguage"));
        return embed;
    }
}