const { MessageEmbed } = require("discord.js");
const { readDataSync, saveData } = require("../utility/dataHandler");
const { translate } = require("../utility/translate");

const filePath = "./data/reminders.json";
var reminders = new Map();

function loadReminders() {
    reminders = readDataSync(filePath);
}

/*
reminder = {
    id: reminderId,
    description: description,
    userId: userId,
    date: date,
    language: language
}
*/
function createReminder(reminder) {
    reminders.set(reminder.id, reminder);
    saveData(reminders, filePath);
    return reminders;
}

function deleteReminder(id, user) {
    const reminder = getReminder(id);

    if (reminder.userId != user.id) {
        throw new Error("Unauthorized");
    }

    reminders.delete(reminder.id);
    saveData(reminders, filePath);
}

function getReminderList(user) {
    const userId = user.id;
    return Array.from(reminders.values()).filter(reminder => reminder.userId === userId);
}

function getReminder(reminderId) {
    var storedReminder = reminders.get(reminderId);

    //Throw error, if not existing
    if (!storedReminder) {
        throw new Error("Failed to find reminder");
    }

    return storedReminder;
}

async function remind(reminder, bot) {
    const language = reminder.language;
    var user = undefinded;

    user = await bot.users.fetch(reminder.userId);

    const embed = new MessageEmbed()
        .setColor("#FF9200")
        .setTitle(translate(language, "reminder.title"))
        .setDescription(reninder.description);

    await user.send({ embeds: [embed] });
}

async function checkReminder(bot) {
    const currentTime = DateTime.now();
    reminders.forEach(async (reminder) => {
        if (currentTime.diff(DateTime.fromISO(reminder.date)).milliseconds >= 0) {
            try {
                await remind(reminder, bot);
            } catch (error) {
                logger.error("Failed to remind user: ", error);
            }
        }
    });
}


module.exports.loadReminders = loadReminders;
module.exports.createReminder = createReminder;
module.exports.deleteReminder = deleteReminder;
module.exports.getReminderList = getReminderList;
module.exports.checkReminder = checkReminder;