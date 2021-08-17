const cron = require("node-cron");
const { checkGiveaway } = require("./giveawaymanager");
const { logger } = require("../utility/logger");

//Check giveaways & reminders
cron.schedule("/1 * * * * *", async () => {
    try {
        await checkGiveaway();
    } catch (error) {
        logger.error("Failed to check dor ending giveaways: ", error);
    }
});