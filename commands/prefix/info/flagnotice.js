const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { sendLogEmbed } = require('../../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flagnotice')
    .setDescription('Flags a user for manual review and sends them a notification.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to flag')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const requiredRoleId = '1387212542245339209';
      const flaggedRoleId = '1388991296710115439';
      const reviewChannelId = '1389002585746313308';

      // Check if executor has the required role
      if (!interaction.member.roles.cache.has(requiredRoleId)) {
        return await interaction.editReply({ content: '❌ You do not have permission to use this command.' });
      }

      const user = interaction.options.getMember('user');
      if (!user) {
        return await interaction.editReply({ content: '❌ The specified user could not be found in the server.' });
      }

      const flaggedRole = interaction.guild.roles.cache.get(flaggedRoleId);
      if (flaggedRole && !user.roles.cache.has(flaggedRole.id)) {
        await user.roles.add(flaggedRole).catch(() => {});
      }

      const embed = new EmbedBuilder()
        .setTitle('Your account has been flagged')
        .setDescription(
          'Your account has been flagged by our system. A member of our community staff will review your account and decide if it meets our standards.\n\n' +
          'If accepted, access will be restored. If rejected, you will be removed from the server.\n\n' +
          '⚠️ Attempts to bypass this system will result in permanent bans.'
        )
        .setColor(0x2f3136)
        .setThumbnail('https://i.ibb.co/r2qdBWV5/USCG.webp')
        .setTimestamp();

      // Attempt to DM the user
      await user.send({ embeds: [embed] }).catch(() => {});

      // Send embed to review channel
      const channel = client.channels.cache.get(reviewChannelId);
      if (channel) {
        await channel.send({ content: `${user}`, embeds: [embed] });
      }

      await interaction.editReply({ content: `✅ Flag notice sent for ${user.user.tag}.` });

      // Log the flag action
      await sendLogEmbed(client, interaction, `Flagged <@${user.id}> for manual review.`);
    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred while flagging the user.' }).catch(() => {});
      }
    }
  },
};


