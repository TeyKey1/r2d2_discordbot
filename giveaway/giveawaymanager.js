const { MessageEmbed } = require("discord.js");
const { readDataSync, saveData } = require("../utility/dataHandler");
const { getGuildById } = require("../guild/guildmanager");
const { translate } = require("../utility/translate");
const { DateTime } = require("luxon");
const { getWinners } = require("../utility/random");
const { giveaway: logger } = require("../utility/logger");

const filePath = "./data/giveaways.json";
var giveaways = new Map();

function loadGiveaways() {
    giveaways = readDataSync(filePath);
}

async function modifyGiveaway(giveaway, guild, language) {
    if (giveaway.guild != guild.id) {
        throw new Error("Unauthorized");
    }

    const channel = await guild.channels.resolve(giveaway.channel);
    const message = await channel.messages.resolve(giveaway.id);
    await message.edit(":regional_indicator_g: :regional_indicator_i: :regional_indicator_v: :regional_indicator_e: :regional_indicator_a: :regional_indicator_w: :regional_indicator_a: :regional_indicator_y:", createEmbedGiveaway(giveaway, language));

    giveaways.set(giveaway.id, giveaway);
    saveData(giveaways, filePath);
    return giveaway;
}

async function deleteGiveaway(giveawayId, guild) {
    const giveaway = getGiveaway(giveawayId);

    if (giveaway.guild != guild.id) {
        throw new Error("Unauthorized");
    }

    const channel = await guild.channels.resolve(giveaway.channel);
    const message = await channel.messages.fetch(giveaway.id);
    await message.delete();

    giveaways.delete(giveawayId);

    saveData(giveaways, filePath);
}

/*
giveaway{
    id: messageId,
    channel: channelId,
    guild: guildId,
    reminderChannel: channelId,
    prize: prize,
    winners: winners,
    endDate: endDate
}
*/
async function createGiveaway(giveaway, guild, language) {

    const channel = await guild.channels.resolve(giveaway.channel);

    if (!channel.isText()) {
        throw new Error("Channel is not a textchannel");
    }

    const embed = createEmbedGiveaway(giveaway, language);

    const message = await channel.send({ content: ":regional_indicator_g: :regional_indicator_i: :regional_indicator_v: :regional_indicator_e: :regional_indicator_a: :regional_indicator_w: :regional_indicator_a: :regional_indicator_y:", embeds: [embed] });
    await message.react("🎁");

    giveaway.id = message.id;

    giveaways.set(giveaway.id, giveaway);

    saveData(giveaways, filePath);

    return giveaway;
}

function getGiveaway(giveawayId) {
    var storedGiveaway = giveaways.get(giveawayId);

    //Throw error, if not existing
    if (!storedGiveaway) {
        throw new Error("Failed to find Giveaway");
    }

    return storedGiveaway;
}

function getGiveawayList(guild) {
    const guildId = guild.id;
    return Array.from(giveaways.values()).filter(giveaway => giveaway.guild === guildId);
}

async function endGiveaway(giveawayId, bot) {
    const giveaway = getGiveaway(giveawayId);
    var storedGuild = undefined;

    try {
        storedGuild = getGuildById(giveaway.guild);
    } catch (err) {
        giveaways.delete(giveawayId);
        saveData(giveaways, filePath);
        return;
    }
    const language = storedGuild.language;

    const guild = await bot.guilds.resolve(giveaway.guild);
    const reminderChannel = await guild.channels.resolve(giveaway.reminderChannel);
    const channel = await guild.channels.resolve(giveaway.channel);
    const message = await channel.messages.fetch(giveaway.id);

    //determine winner:
    const reactions = message.reactions.cache;
    var participants = [];
    reactions.forEach(async e => {
        if (e.emoji.toString() === "🎁") {
            const users = await e.users.fetch();
            users.forEach(user => {
                if (user.bot) {
                    return;
                }
                participants.push({ username: user.username, id: user.id });
            });
        }
    });

    await message.reactions.removeAll();

    var winners = undefined;
    logger.info(`Ending Giveaway id: ${giveaway.id}...`);
    if (participants.length == 0) {
        //failed to end giveaway
        logger.info("Failed to end giveaway. No participants!")
        const embed = new MessageEmbed()
            .setColor("#ff1100")
            .setTitle(translate(language, "giveaway.end.failedTitle"))
            .setDescription(translate(language, "giveaway.end.failedDescription"));
        await message.edit({ content: "** **", embeds: [embed] });
        reminderChannel.send({ content: translate(language, "giveaway.end.notificationFailed") + channel.toString() });

        //delete giveaway
        giveaways.delete(giveawayId);
        saveData(giveaways, filePath);

        return;
    } else if (participants.length <= giveaway.winners) {
        logger.info("More or equal prizes available than participants, everyone wins: \n" + participants.map(e => e.username).join(", \n"));
        winners = participants;
    } else {
        winners = await getWinners(participants, giveaway.winners);
    }

    //Send message:
    await message.edit({ content: translate(language, "giveaway.end.winners") + winners.map(e => `<@${e.id}>`).join(", ") + ":tada:", embeds: [createEmbedWinner(giveaway, winners, language)] });

    //Send reminder
    reminderChannel.send({ content: translate(language, "giveaway.end.notification") + channel.toString() });

    //delete giveaway
    giveaways.delete(giveawayId);
    saveData(giveaways, filePath);
}

/*
*  Check if any of the stored giveaways is ending
*/
async function checkGiveaway(bot) {
    const currentTime = DateTime.now();
    giveaways.forEach(async (giveaway) => {
        if (currentTime.diff(DateTime.fromISO(giveaway.endDate)).milliseconds >= 0) {
            try {
                await endGiveaway(giveaway.id, bot);
            } catch (error) {
                logger.error("Failed to end giveaway: ", error);
            }
        }
    });
}

/*
* Check if Giveaway exists in Database. Returns the giveaway data if it exists
*/
function exists(giveawayId) {
    var giveawayData = undefined;

    if (giveaways.has(giveawayId)) {
        giveawayData = giveaways.get(giveawayId);
    }

    return giveawayData;
}

function createEmbedGiveaway(giveaway, language) {
    return new MessageEmbed()
        .setColor("#fc6203")
        .setDescription(translate(language, "giveaway.create.prize") + giveaway.prize + "\n\n" + translate(language, "giveaway.create.reactDate") + DateTime.fromISO(giveaway.endDate).toFormat(`dd.MM.yyyy `) + translate(language, "giveaway.create.dateConnector") + DateTime.fromISO(giveaway.endDate).toFormat(` HH:mm`))
        .setFooter(translate(language, "giveaway.create.winnerAmount") + giveaway.winners);
}

function createEmbedWinner(giveaway, winners, language) {
    return new MessageEmbed()
        .setColor("#990099")
        .setTitle(translate(language, "giveaway.end.congratulations"))
        .setDescription(translate(language, "giveaway.end.prize") + giveaway.prize);
}

module.exports.loadGiveaways = loadGiveaways;
module.exports.modifyGiveaway = modifyGiveaway;
module.exports.createGiveaway = createGiveaway;
module.exports.deleteGiveaway = deleteGiveaway;
module.exports.getGiveaway = getGiveaway;
module.exports.endGiveaway = endGiveaway;
module.exports.checkGiveaway = checkGiveaway;
module.exports.getGiveawayList = getGiveawayList;