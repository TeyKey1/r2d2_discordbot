const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { giveaway } = require("../utility/logger");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");
const { Duration, DateTime } = require("luxon");
const { createGiveaway, getGiveawayList, deleteGiveaway } = require("../giveaway/giveawaymanager");
const { logger } = require("../utility/logger");
const { parseDiscordMessageLink } = require("../utility/parser");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Randomly chooses a winner out of the provided names")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Creates a new giveaway")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("The channel in which the giveaway takes place")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("Duration of the giveaway")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("durationunit")
                        .setDescription("Unit of the specified duration")
                        .setRequired(true)
                        .addChoices([
                            ["minutes", "minutes"],
                            ["hours", "hours"],
                            ["days", "days"],
                            ["weeks", "weeks"],
                        ]),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("winners")
                        .setDescription("Amount of winners")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("prize")
                        .setDescription("Description of the prize")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("modify")
                .setDescription("Modifies an existing giveaway")
                .addStringOption((option) =>
                    option
                        .setName("url_or_id")
                        .setDescription("The url of the giveaway message or the id of the giveaway (/giveaways list), you want to edit")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("New duration of the giveaway")
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("durationunit")
                        .setDescription("New of the specified duration")
                        .setRequired(false)
                        .addChoices([
                            ["minutes", "m"],
                            ["hours", "h"],
                            ["days", "d"],
                            ["weeks", "w"],
                        ]),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("winners")
                        .setDescription("New amount of winners")
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("prize")
                        .setDescription("New description of the prize")
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Deletes a giveaway")
                .addStringOption((option) =>
                    option
                        .setName("url_or_id")
                        .setDescription("The url of the giveaway message or the id of the giveaway (/giveaways list), you want to delete")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Lists all active giveaways and their id's on this server"),
        ),
    async execute({ interaction, storedGuild, language }) {
        var embed = new MessageEmbed();

        if (!checkPermission("user", interaction.member, storedGuild)) {
            embed
                .setColor("#ff1100")
                .setDescription(translate(language, "commands.errors.permission"));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case "create":
                await handleCreateSubcommand({ interaction, language });
                break;
            case "modify":
                await handleModifySubcommand({ interaction, storedGuild, language });
                break;
            case "delete":
                await handleDeleteSubcommand({ interaction, storedGuild, language });
                break;
            case "list":
                await handleListSubcommand({ interaction, storedGuild, language });
                break;
            default:
                throw new Error("Specified subcommand group does not exist");
        }
    },
};

async function handleCreateSubcommand({ interaction, language }) {
    var embed = new MessageEmbed();
    const guild = interaction.guild;
    const winnerAmount = validateIntegerAmount(interaction.options.getInteger("winners", true));
    const durationAmount = validateIntegerAmount(interaction.options.getInteger("duration", true));

    if (!winnerAmount) {
        embed
            .setColor("#FF9200")
            .setDescription(translate(language, "commands.errors.giveaway.create.winnerAmount"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    } else if (!durationAmount) {
        embed
            .setColor("#FF9200")
            .setDescription(translate(language, "commands.errors.giveaway.create.durationAmount"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    //calculate end date:
    var obj = {};
    obj[interaction.options.getString("durationunit", true)] = durationAmount;
    const endDate = DateTime.now().plus(Duration.fromObject(obj));

    const giveaway = {
        id: "",
        channel: interaction.options.getChannel("channel", true).id,
        guild: guild.id,
        reminderChannel: interaction.channelId,
        prize: interaction.options.getString("prize", true),
        winners: winnerAmount,
        endDate: endDate.toISO()
    }

    try {
        await createGiveaway(giveaway, guild, language);
    } catch (error) {
        if (error.message === "Channel is not a textchannel") {
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.giveaway.create.textChannel"));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        } else {
            logger.error("Failed to create giveaway: ", error);
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.giveaway.create.general") + error.message);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
    }

    embed
        .setColor("#0aa12d")
        .setDescription(translate(language, "commands.giveaway.create.success"));
    await interaction.reply({ embeds: [embed] });
}

async function handleModifySubcommand({ interaction, storedGuild, language }) {

}

async function handleDeleteSubcommand({ interaction, language }) {
    var embed = new MessageEmbed;
    const giveawayId = getGiveawayId(interaction.options.getString("url_or_id", true));

    if (!giveawayId) {
        embed
            .setColor("#FF9200")
            .setDescription(translate(language, "commands.errors.giveaway.delete.invalidArgument"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    try {
        console.log(giveawayId);
        await deleteGiveaway(giveawayId, interaction.guild);
    } catch (error) {
        if (error.message === "Unauthorized" || error.message == "Failed to find Giveaway") {
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.giveaway.delete.notFound"));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        } else {
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.giveaway.delete.general") + error);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
    }

    embed
        .setColor("#0aa12d")
        .setDescription(translate(language, "commands.giveaway.delete.success"));
    await interaction.reply({ embeds: [embed] });
}

async function handleListSubcommand({ interaction, language }) {
    const giveaways = getGiveawayList(interaction.guild);
    var embed = new MessageEmbed()
        .setColor("#1CACE5")
        .setTitle(translate(language, "commands.giveaway.list.title"));

    if (giveaways.length == 0) {
        embed.setDescription(translate(language, "commands.giveaway.list.empty"));
        interaction.reply({ embeds: [embed] });
        return;
    }

    embed.setDescription(translate(language, "commands.giveaway.list.description"));

    giveaways.forEach(giveaway => {
        embed.addField(giveaway.id, `***${translate(language, "commands.giveaway.list.channel")}*** <#${giveaway.channel}> ***${translate(language, "commands.giveaway.list.end")}*** ${DateTime.fromISO(giveaway.endDate).toFormat(`dd.MM.yyyy `) + translate(language, "giveaway.create.dateConnector") + DateTime.fromISO(giveaway.endDate).toFormat(` HH:mm`)}\n***${translate(language, "commands.giveaway.list.prize")}*** ${giveaway.prize}`);
    });

    interaction.reply({ embeds: [embed] });
}

function validateIntegerAmount(integerAmount) {
    if (integerAmount == 0) {
        return undefined;
    }
    return Math.abs(integerAmount);
}

function getGiveawayId(string) {
    string.trim();

    if (string.length > 18) {
        const result = parseDiscordMessageLink(string);
        if (result) {
            return result.messageId;
        }
        return undefined;
    } else {
        if (parseInt(string) === NaN) {
            return undefined;
        }
        return string;
    }
}