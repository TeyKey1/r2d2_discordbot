const cron = require("node-cron");
const { checkGiveaway } = require("./giveawaymanager");
const { logger } = require("../utility/logger");

//Check giveaways & reminders
cron.schedule("*/1 * * * *", async () => {
    try {
        await checkGiveaway();
        logger.debug("checking giveaways...");
    } catch (error) {
        logger.error("Failed to check for ending giveaways: ", error);
    }
});