const { DateTime } = require("luxon");

function parseDurationToDate(string) {
    const identifier = string.slice(-1);
    const duration = parseInt(string.slice(0, -1).trim());

    var endDate = DateTime.now();
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

module.exports.parseDurationToDate = parseDurationToDate;