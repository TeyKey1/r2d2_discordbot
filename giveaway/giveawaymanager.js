const { MessageEmbed } = require("discord.js");
const { readDataSync, saveData } = require("../utility/dataHandler");
const bot = require("../index");
const { getGuildById } = require("../guild/guildmanager");
const { translate } = require("../utility/translate");
const { DateTime } = require("luxon");

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
    const message = await channel.messages.resolve(giveaway.id);
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

    const message = await channel.send(":regional_indicator_g: :regional_indicator_i: :regional_indicator_v: :regional_indicator_e: :regional_indicator_a: :regional_indicator_w: :regional_indicator_a: :regional_indicator_y:", embed);
    await message.react("U+1F381");

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

async function endGiveaway(giveawayId) {
    const giveaway = getGiveaway(giveawayId);

    try {
        const storedGuild = getGuildById(giveaway.guild);
    } catch (err) {
        giveaways.delete(giveawayId);
        saveData(giveaways, filePath);
        return;
    }
    const language = storedGuild.language;

    const guild = await bot.guilds.resolve(giveaway.guild);
    const reminderChannel = await guild.channels.resolve(giveaway.reminderChannel);
    const channel = await guild.channels.resolve(giveaway.channel);
    const message = await channel.messages.resolve(giveaway.id);

    //determine winner:


    //Send message:
    await message.reactions.removeAll();
    await message.edit(translate(language, "giveawayEndWinners") + winners + ":tada:", createEmbedWinner(giveaway, winners, language));

    //Send reminder / delete giveaway
    reminderChannel.send(translate(language, "giveawayEndNotification") + reminderChannel.toString());

    giveaways.delete(giveawayId);
    saveData(giveaways, filePath);
}

/*
*  Check if any of the stored giveaways is ending
*/
function checkGiveaway() {
    const currentTime = DateTime.now();
    giveaways.forEach((giveaway) => {
        if (currentTime.diff(giveaway.endDate).milliseconds >= 60000) {
            try {
                endGiveaway(giveaway.id);
            } catch (error) {

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
        .setTitle(giveaway.prize)
        .addField(translate(language, "giveawayCreateReactDate") + giveaway.endDate.toString())
        .setFooter(translate(language, "giveawayCreateWinnerAmount") + giveaway.winners);
}

function createEmbedWinner(giveaway, winners, language) {
    return new MessageEmbed()
        .setColor("#990099")
        .setTitle(translate(language, "giveawayEndCongratulations"))
        .setDescription(translate(language, "giveawayEndPrize") + giveaway.prize);
}

module.exports.loadGiveaways = loadGiveaways;
module.exports.modifyGiveaway = modifyGiveaway;
module.exports.createGiveaway = createGiveaway;
module.exports.deleteGiveaway = deleteGiveaway;
module.exports.getGiveaway = getGiveaway;
module.exports.endGiveaway = endGiveaway;