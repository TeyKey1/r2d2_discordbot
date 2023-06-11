const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Shows R2D2 about page"),
    async execute({ interaction, storedGuild, language }) {
        var embed = new EmbedBuilder();

        if (!checkPermission("user", interaction.member, storedGuild)) {
            embed
                .setColor("#ff1100")
                .setDescription(translate(language, "commands.errors.permission"));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed
            .setColor("#E55A1C")
            .setTitle("About R2D2 Discord Bot")
            .addFields([
                { name: "Droid version:", value: `${process.pid}` },
                { name: "Developer", value: "TeyKey1" },
                { name: "Version:", value: `${process.env.npm_package_version}` },
                { name: "Github:", value: "https://github.com/TeyKey1/r2d2_discordbot" }
            ]);

        await interaction.reply({ embeds: [embed] });
    },
};