const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../core/db');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('🔧 Set the log channel for this server. A channel must be selected.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('📍 Select the channel where logs should be sent. This is required.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const channel = interaction.options.getChannel('channel');
      if (!channel) {
        return interaction.editReply({ content: '❌ Please select a valid channel.' });
      }

      const guildId = interaction.guild.id;

      await db.query(
        'INSERT INTO guild_settings (guild_id, log_channel) VALUES (?, ?) ON DUPLICATE KEY UPDATE log_channel = VALUES(log_channel)',
        [guildId, channel.id]
      );

      await interaction.editReply({ content: `✅ Logs will now be sent to ${channel}.` });

      await sendLogEmbed(client, interaction, `Log channel set to ${channel}`);
    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred.' }).catch(() => {});
      }
    }
  },
};
