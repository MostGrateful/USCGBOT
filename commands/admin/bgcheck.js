const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');
const { performBackgroundCheck } = require('../../utils/backgroundCheckUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bgcheck')
    .setDescription('Run a background check on a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to check')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    try {
      const requiredRoleId = '1387212542245339209';
      if (!interaction.member.roles.cache.has(requiredRoleId)) {
        return await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
      }

      const targetUser = interaction.options.getUser('target');
      await interaction.deferReply({ ephemeral: true });

      const resultEmbed = await performBackgroundCheck(targetUser);
      await interaction.editReply({ embeds: [resultEmbed] });

      await sendLogEmbed(client, interaction, `User ran /bgcheck on <@${targetUser.id}>`);
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

