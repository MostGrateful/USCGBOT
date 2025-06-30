const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the bot latency'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const sent = await interaction.fetchReply();
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      await interaction.editReply({
        content: `🏓 Pong!\n**Bot Latency:** ${latency}ms\n**API Latency:** ${apiLatency}ms`,
      });
    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred while calculating latency.' }).catch(() => {});
      }
    }
  },
};


