const { DateTime } = require("luxon");

function parseDurationToDate(string) {
    const identifier = string.slice(-1);
    const duration = parseInt(string.slice(0, -1).trim());

    let endDate = DateTime.now();
    switch (identifier) {
        case "m":
            endDate.plus({ minutes: duration });
            break;
        case "h":
            endDate.plus({ hours: duration });
            break;
        case "d":
            endDate.plus({ days: duration });
            break;
        default:
            throw new Error("Failed to parse duration");
    }

    return endDate;
}

function parseDiscordMessageLink(link) {
    if (link.substring(0, 29).toLowerCase() === "https://discord.com/channels/") {
        const guildId = link.substring(29, 47);
        const channelId = link.substring(48, 66);
        const messageId = link.substring(67);

        if (guildId.match(/^[0-9]+$/) == null || channelId.match(/^[0-9]+$/) == null || messageId.match(/^[0-9]+$/) == null) {
            return undefined;
        }

        return { guildId, channelId, messageId };
    } else if (link.substring(0, 32).toLowerCase() === "https://discordapp.com/channels/") {
        const guildId = link.substring(32, 50);
        const channelId = link.substring(51, 69);
        const messageId = link.substring(70);

        if (guildId.match(/^[0-9]+$/) == null || channelId.match(/^[0-9]+$/) == null || messageId.match(/^[0-9]+$/) == null) {
            return undefined;
        }

        return { guildId, channelId, messageId };
    } else {
        return undefined;
    }
}

module.exports.parseDurationToDate = parseDurationToDate;
module.exports.parseDiscordMessageLink = parseDiscordMessageLink;