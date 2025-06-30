const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../core/db');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancelgiveaway')
    .setDescription('Cancel an active giveaway.')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('The ID of the giveaway to cancel')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const giveawayId = interaction.options.getInteger('id');

      const [rows] = await db.query('SELECT * FROM giveaways WHERE id = ? AND is_active = 1', [giveawayId]);
      const giveaway = rows[0];

      if (!giveaway) {
        return await interaction.editReply({ content: '❌ No active giveaway found with that ID.' });
      }

      const isOwner = giveaway.creator_id === interaction.user.id;
      const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);

      if (!isOwner && !hasPermission) {
        return await interaction.editReply({ content: '❌ Only the giveaway creator or an admin can cancel this giveaway.' });
      }

      await db.query('UPDATE giveaways SET is_active = 0 WHERE id = ?', [giveawayId]);

      const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
      if (channel) {
        await channel.send(`⚠️ Giveaway **"${giveaway.prize}"** (ID: ${giveaway.id}) has been **cancelled**.`);
      }

      await interaction.editReply({ content: `✅ Giveaway ID ${giveaway.id} has been cancelled.` });

      await sendLogEmbed(client, interaction, `Cancelled giveaway ID **${giveaway.id}** (${giveaway.prize}).`);
    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred while cancelling the giveaway.' }).catch(() => {});
      }
    }
  },
};






