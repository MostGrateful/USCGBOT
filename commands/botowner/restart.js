const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const ALLOWED_USERS = ['1021175652243751013', '238058962711216130', '559387780606590986'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'restart',
  description: 'Restart the bot.',
  usage: '!restart',

  async execute(interactionOrMessage, client) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const userId = isInteraction ? interactionOrMessage.user.id : interactionOrMessage.author.id;

    if (!ALLOWED_USERS.includes(userId)) {
      const reply = '❌ You are not authorized to restart the bot.';
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    const reply = '🔄 Restarting the bot...';
    if (isInteraction) {
      await interactionOrMessage.reply({ content: reply, ephemeral: true });
    } else {
      await interactionOrMessage.reply(reply);
    }

    console.log('🔁 Restart initiated by:', userId);
    await client.destroy();
    process.exit(0); // Your host should automatically restart the bot
  }
};
