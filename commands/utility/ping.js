const { SlashCommandBuilder } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  async execute(interaction, client) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(`🏓 Pong! Latency is ${latency}ms.`);
    await sendLogEmbed(client, interaction, `🏓 Ping command used. Latency: ${latency}ms.`);
  }
};

