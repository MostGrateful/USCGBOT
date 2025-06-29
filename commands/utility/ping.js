const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  name: 'ping', // <- For prefix usage
  description: 'Replies with Pong!',
  async execute(interactionOrMessage, isPrefix = false) {
    const reply = `🏓 Pong!`;

    if (isPrefix) {
      interactionOrMessage.reply(reply);
    } else {
      await interactionOrMessage.reply(reply);
    }
  },
};
