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
    // Permission check for required role
    const requiredRoleId = '1387212542245339209';
    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');

    // Defer reply to allow time for background check
    await interaction.deferReply({ ephemeral: true });

    try {
      const resultEmbed = await performBackgroundCheck(targetUser);
      await interaction.editReply({ embeds: [resultEmbed] });

      // Log the command usage
      await sendLogEmbed(client, interaction, `User ran /bgcheck on <@${targetUser.id}>`);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ An error occurred while performing the background check.' });
    }
  },
};
