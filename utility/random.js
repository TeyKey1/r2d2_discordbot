const RandomOrg = require("random-org");
const config = require("config");
const { giveaway } = require("../utility/logger");

var random = new RandomOrg({ apiKey: config.get("randomOrgToken") });

async function getWinners(participants, amount) {
    giveaway.info(`Starting to evaluate ${amount} winners out of participants: \n${(()=>{
        var str = "";
        for (let i = 0; i < participants.length; i++) {
            str += `Index: ${i} Participant: ${participants[i]}\n`
        }
        return str;
    })()}`);
    const length = participants.length;
    var winners = [];
    var randomInts = [];

    try {
        //Generate truly random numbers:
        const response = await random.generateIntegers({ min: 0, max: length - 1, n: amount, replacement: false });
        randomInts = response.random.data;
    } catch (err) {
        giveaway.info("Failed to fetch random numbers from random.org: ", err);
        giveaway.info("Falling back to pseudo randomness");

        //Pseudo random number backup in case API does not respond
        for (var i = 0; i < amount; i++) {
            const randomInt = Math.floor(Math.random() * length);
            if (randomInts.includes(randomInt)) {
                i--;
                continue;
            } else {
                randomInts.push(randomInt);
            }
        }
    }

    giveaway.info("Randomly generated integers: " + randomInts.join(", "));

    randomInts.forEach((num) => {
        winners.push(participants[num]);
    });

    giveaway.info("Winners of this giveaway: " + winners);

    return winners;
}

module.exports.getWinners = getWinners;