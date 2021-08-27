const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays the help page of the bot"),
    async execute({ interaction, storedGuild }) {
        var embed = new MessageEmbed();

        if (checkPermission("admin", interaction.member, storedGuild)) {
            embed
                .setColor("#1CACE5")
                .setDescription(translate(storedGuild.language, "commands.help.admin"));
            await interaction.reply({ embeds: [embed] });
            return;
        } else if (checkPermission("user", interaction.member, storedGuild)) {
            embed
                .setColor("#1CACE5")
                .setDescription(translate(storedGuild.language, "commands.help.user"));
            await interaction.reply({ embeds: [embed] });
            return;
        }

        embed
            .setColor("#ff1100")
            .setDescription(translate(storedGuild.language, "commands.errors.permission"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};