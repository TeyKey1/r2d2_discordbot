const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, SnowflakeUtil } = require("discord.js");
const { Duration, DateTime } = require("luxon");
const { checkPermission } = require("../guild/permissionmanager");
const { translate } = require("../utility/translate");
const { createReminder, deleteReminder, getReminderList } = require("../reminder/remindermanager");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("Creates a reminder")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Creates a new reminder")
                .addIntegerOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("Duration until you should be reminded")
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
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("What you want to be reminded about")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Deletes a reminder")
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("The id of the reminder (/reminder list), you want to delete")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Lists all of your reminders"),
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
            case "delete":
                await handleDeleteSubcommand({ interaction, language });
                break;
            case "list":
                await handleListSubcommand({ interaction, language });
                break;
            default:
                throw new Error("Specified subcommand group does not exist");
        }
    },
};

async function handleCreateSubcommand({ interaction, language }) {
    var embed = new MessageEmbed();
    const durationAmount = validateIntegerAmount(interaction.options.getInteger("duration", true));

    if (!durationAmount) {
        embed
            .setColor("#FF9200")
            .setDescription(translate(language, "commands.errors.reminder.create.durationAmount"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    //calculate end date:
    var obj = {};
    obj[interaction.options.getString("durationunit", true)] = durationAmount;
    const endDate = DateTime.now().plus(Duration.fromObject(obj));

    const reminder = {
        id: SnowflakeUtil.generate(),
        description: interaction.options.getString("description", true),
        userId: interaction.user.id,
        date: endDate.toISO(),
        language: language
    }

    createReminder(reminder);

    embed
        .setColor("#0aa12d")
        .setDescription(translate(language, "commands.reminder.create.success"));
    await interaction.reply({ embeds: [embed] });
}

async function handleDeleteSubcommand({ interaction, language }) {
    var embed = new MessageEmbed;
    const reminderId = getReminderId(interaction.options.getString("id", true));

    if (!reminderId) {
        embed
            .setColor("#FF9200")
            .setDescription(translate(language, "commands.errors.reminder.delete.invalidArgument"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    try {
        deleteReminder(reminderId, interaction.user);
    } catch (error) {
        if (error.message === "Unauthorized" || error.message == "Failed to find reminder") {
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.reminder.delete.notFound"));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        } else {
            embed
                .setColor("#FF9200")
                .setDescription(translate(language, "commands.errors.reminder.delete.general") + error);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
    }

    embed
        .setColor("#0aa12d")
        .setDescription(translate(language, "commands.reminder.delete.success"));
    await interaction.reply({ embeds: [embed] });
}

async function handleListSubcommand({ interaction, language }) {
    const reminders = getReminderList(interaction.user);
    var embed = new MessageEmbed()
        .setColor("#1CACE5")
        .setTitle(translate(language, "commands.reminder.list.title"));

    if (reminders.length == 0) {
        embed.setDescription(translate(language, "commands.reminder.list.empty"));
        interaction.reply({ embeds: [embed] });
        return;
    }

    embed.setDescription(translate(language, "commands.reminder.list.description"));

    reminders.forEach(reminder => {
        embed.addField(reminder.id, `***${translate(language, "commands.reminder.list.end")}*** ${DateTime.fromISO(reminder.date).toFormat(`dd.MM.yyyy `) + translate(language, "reminder.dateConnector") + DateTime.fromISO(reminder.date).toFormat(` HH:mm`)}\n***${translate(language, "commands.reminder.list.reminderDescription")}*** ${reminder.description}`);
    });

    interaction.reply({ embeds: [embed] });
}

function getReminderId(string) {
    string.trim();

    if (parseInt(string) === NaN) {
        return undefined;
    }

    return string;
}

function validateIntegerAmount(integerAmount) {
    if (integerAmount == 0) {
        return undefined;
    }
    return Math.abs(integerAmount);
}