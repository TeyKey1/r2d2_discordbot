const cron = require("node-cron");
const { checkGiveaway } = require("../giveaway/giveawaymanager");
const { checkReminder } = require("../reminder/remindermanager");
const { logger } = require("./logger");

function scheduleGiveaways(bot) {
    cron.schedule("*/1 * * * *", async () => {
        try {
            await checkGiveaway(bot);
            logger.debug("checking giveaways...");
        } catch (error) {
            logger.error("Failed to check for ending giveaways: ", error);
        }
    });
}

function scheduleReminders(bot) {
    cron.schedule("*/5 * * * *", async () => {
        try {
            await checkReminder(bot);
            logger.debug("checking reminders...");
        } catch (error) {
            logger.error("Failed to check for reminders: ", error);
        }
    });
}

module.exports.scheduleGiveaways = scheduleGiveaways;
module.exports.scheduleReminders = scheduleReminders;