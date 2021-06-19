const RandomOrg = require("random-org");
const config = require("config");

var random = new RandomOrg({ apiKey: config.get("randomOrgToken") });

function getRandomNumber(){
    return random.generateIntegers({ min: 1, max: 99, n: 1 });
}

module.exports.getRandomNumber = getRandomNumber;