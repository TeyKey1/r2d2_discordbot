const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { giveaway } = require("../utility/logger");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");
const {getWinners} = require("../utility/random");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("randomchoose")
		.setDescription("Randomly chooses a winner out of the provided names")
        .addStringOption(option => {
            return option
                .setName("participants")
                .setDescription("Comma separated list of participants")
                .setRequired(true)
        })
        .addIntegerOption(option => {
            return option
                .setName("winneramount")
                .setDescription("Amount of winners to be determined")
                .setRequired(false)
        }),
	async execute({interaction, storedGuild, language}) {
        var embed = new MessageEmbed();

        if (!checkPermission("user", interaction.member, storedGuild)) {
            embed
                .setColor("#ff1100")
                .setDescription(translate(language, "commands.errors.permission"));
            await interaction.reply({embeds: [embed], ephemeral: true});
            return;
        }

        const participantString = interaction.options.getString("participants", true);
        const participants = participantString.split(",").map(i => i.trim());
        const winnerAmount = interaction.options.getInteger("winneramount", false) ? Math.abs(interaction.options.getInteger("winneramount", false)) : 1;
        
        if(participants.length <= 1){
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.randomChoose.participants"));
            await interaction.reply({embeds: [embed], ephemeral: true});
            return;
        }else if(participants.length < winnerAmount){
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.randomChoose.winnerAmount"));
            await interaction.reply({embeds: [embed], ephemeral: true});
            return;
        }

        giveaway.info("Starting randomChoose: ")
        const winners = await getWinners(participants, winnerAmount);

        embed
            .setColor("#1CACE5")
            .setTitle(translate(language, "commands.randomChoose.title"))
            .setDescription("```ml\n" + translate(language, "commands.randomChoose.description") + winnerAmount +"```")
            .setFooter(translate(language, "commands.randomChoose.footer") + participants.length);

        const winnerEmbed = new MessageEmbed()
            .setColor("#edc531")
            .setTitle(translate(language, "commands.randomChoose.winner") + winners.join(", "));
        
        await interaction.reply({embeds: [embed, winnerEmbed]});
	},
};