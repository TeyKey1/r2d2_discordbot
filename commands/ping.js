const {getRandomNumber} = require("../utility/random");

module.exports = {
  slash: true,
  testOnly: true, // Ensure you have test servers setup, see the below paragraph
  description: 'A simple ping pong command', // Required for slash commands
  category: 'Fun & Games',
  callback: async ({}) => {
    // The content to reply with must be returned from the callback function
    // This is required for slash commands exclusively
    var number = await getRandomNumber();
    return 'pong' + number.random.data[0];
  }
}