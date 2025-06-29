const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');

const OWNER_IDS = ['1021175652243751013', '238058962711216130', '559387780606590986'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'restart',
  description: 'Restart the bot (prefix)',

  // Slash command
  async execute(interaction, client) {
    if (!OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
    }

    await interaction.reply({ content: '♻️ Restarting bot...' });
    await sendLogEmbed(client, interaction, 'Bot is restarting...');

    process.exit(0);
  },

  // Prefix command
  async run(message, args, client) {
    if (!OWNER_IDS.includes(message.author.id)) return;

    await message.reply('♻️ Restarting bot...');
    await sendLogEmbed(client, message, 'Bot is restarting...');

    process.exit(0);
  }
};

