const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancelgiveaway')
    .setDescription('Cancel an active giveaway')
    .addStringOption(opt =>
      opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const db = interaction.client.db;

    const [rows] = await db.query('SELECT * FROM giveaways WHERE message_id = ?', [messageId]);
    if (rows.length === 0) {
      return interaction.reply({ content: 'No giveaway found with that message ID.', ephemeral: true });
    }

    const giveaway = rows[0];

    // Only the host or admins can cancel
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (
      giveaway.host_id !== interaction.user.id &&
      !member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({ content: 'Only the giveaway host or an admin can cancel this giveaway.', ephemeral: true });
    }

    await db.query('UPDATE giveaways SET is_active = 0 WHERE message_id = ?', [messageId]);

    try {
      const channel = await interaction.guild.channels.fetch(giveaway.channel_id);
      const message = await channel.messages.fetch(giveaway.message_id);
      await message.edit({ content: '❌ This giveaway has been cancelled.', embeds: [] });
    } catch (err) {
      console.warn('Failed to edit message:', err.message);
    }

    return interaction.reply({ content: '✅ Giveaway successfully cancelled.', ephemeral: true });
  }
};




