const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set the log channel for this server')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send logs to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const db = client.db;
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel');

      // Save to the database
      await db.query('INSERT INTO guild_settings (guild_id, log_channel) VALUES (?, ?) ON DUPLICATE KEY UPDATE log_channel = VALUES(log_channel)', [guildId, channel.id]);

      await interaction.editReply({ content: `✅ Log channel has been set to ${channel}.` });

      await sendLogEmbed(client, interaction, `Log channel has been set to <#${channel.id}>.`);
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


