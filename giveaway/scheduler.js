const cron = require("node-cron");
const { checkGiveaway } = require("./giveawaymanager");
const { logger } = require("../utility/logger");

//Check giveaways & reminders
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

module.exports.scheduleGiveaways = scheduleGiveaways;