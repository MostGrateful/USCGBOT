const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setlog',
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set this channel as the log channel for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const db = client.db;
    const guildId = interaction.guild.id;
    const logChannelId = interaction.channel.id;

    await db.query(
      'INSERT INTO guild_settings (guild_id, log_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE log_channel_id = ?',
      [guildId, logChannelId, logChannelId]
    );

    await interaction.reply({
      content: `✅ Log channel set to <#${logChannelId}> for this server.`,
      ephemeral: true
    });
  },

  async prefix(message, args, client) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ You do not have permission to use this command.');
    }

    const db = client.db;
    const guildId = message.guild.id;
    const logChannelId = message.channel.id;

    await db.query(
      'INSERT INTO guild_settings (guild_id, log_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE log_channel_id = ?',
      [guildId, logChannelId, logChannelId]
    );

    message.reply(`✅ Log channel set to <#${logChannelId}> for this server.`);
  }
};
