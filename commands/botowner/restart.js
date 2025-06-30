const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      await interaction.editReply({ content: '🔄 Restarting bot...' });

      // Log restart action
      await sendLogEmbed(client, interaction, 'Bot restart initiated.');

      // Give Discord a moment to send the reply before shutting down
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred while trying to restart.' }).catch(() => {});
      }
    }
  },
};



