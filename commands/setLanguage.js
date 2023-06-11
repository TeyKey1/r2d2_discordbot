const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");
const { modifyGuild } = require("../guild/guildmanager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlanguage")
        .setDescription("Sets the language of R2D2")
        .addStringOption(option => {
            return option
                .setName("language")
                .setDescription("Language to set")
                .addChoices([
                    ["English", "en"],
                    ["Deutsch", "de"]
                ])
                .setRequired(true)
        }),
    async execute({ interaction, storedGuild }) {
        var embed = new EmbedBuilder();

        if (!checkPermission("admin", interaction.member, storedGuild)) {
            embed
                .setColor("#ff1100")
                .setDescription(translate(storedGuild.language, "commands.errors.permission"));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        storedGuild.language = interaction.options.getString("language", true);
        modifyGuild(storedGuild);

        embed
            .setColor("#0aa12d")
            .setDescription(translate(storedGuild.language, "commands.changeLanguage"));

        await interaction.reply({ embeds: [embed] });
    },
};