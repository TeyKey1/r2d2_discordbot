const { createLogger, format, transports } = require("winston");
const { colorize, label, printf, timestamp } = format;

//Bot logger
var transportList = [
    new transports.File({
        level: "warn",
        filename: "logs/bot.log",
        format: format.json()
    })
];

const consoleFormat = format.combine(
    colorize({
        all: true
    }),
    label({
        label: '[BOT]'
    }),
    timestamp({
        format: "DD-MM-YYYY HH:mm:ss"
    }),
    printf(info => {
        if (info.stack) {
            return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message} \n ${info.stack}`;
        }
        return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    })
);

if (process.env.NODE_ENV === "development") {
    transportList.push(new transports.Console({
        level: "debug",
        format: consoleFormat
    }));
} else {
    transportList.push(new transports.Console({
        level: "info",
        format: consoleFormat
    }));
}

const botLogger = createLogger({
    level: "debug",
    transports: transportList,
    exitOnError: false
});

module.exports.logger = botLogger;

//Giveaway logger
var transportListGiveaway = [
    new transports.File({
        level: "info",
        filename: "logs/giveaway.log",
        format: format.json()
    })
];

const consoleFormatGiveaway = format.combine(
    colorize({
        all: true
    }),
    label({
        label: '[GIVEAWAY]'
    }),
    timestamp({
        format: "DD-MM-YYYY HH:mm:ss"
    }),
    printf(info => {
        if (info.stack) {
            return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message} \n ${info.stack}`;
        }
        return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    })
);

if (process.env.NODE_ENV === "development") {
    transportListGiveaway.push(new transports.Console({
        level: "debug",
        format: consoleFormatGiveaway
    }));
} else {
    transportListGiveaway.push(new transports.Console({
        level: "info",
        format: consoleFormatGiveaway
    }));
}

const giveawayLogger = createLogger({
    level: "debug",
    transports: transportListGiveaway,
    exitOnError: false
});

module.exports.giveaway = giveawayLogger;