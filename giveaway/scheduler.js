const cron = require("node-cron");
const {checkGiveaway} = require("./giveawaymanager");

//Check giveaways & reminders
cron.schedule("/1 * * * * *", async () => {
    await checkGiveaway();
});