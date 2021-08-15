const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("about")
		.setDescription("Shows R2D2 about page"),
	async execute({interaction, storedGuild, language}) {
        var embed = new MessageEmbed();
      
        if (!checkPermission("user", interaction.member, storedGuild)) {
            embed
                .setColor("#ff1100")
                .setDescription(translate(language, "commands.errors.permission"));
            await interaction.reply({embeds: [embed], ephemeral: true});
            return;
        }

        embed
            .setColor("#E55A1C")
            .setTitle("About R2D2 Discord Bot")
            .addField("Droid version:", `${process.pid}`)
            .addField("Developer", "TeyKey1")
            .addField("Version:", `${process.env.npm_package_version}`)
            .addField("Gitbhub:", "Unavailable");

        await interaction.reply({embeds: [embed]});
	},
};