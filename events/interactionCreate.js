const { Events, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logErrorToChannel } = require('../utils/logError');
const { restoreUserRoles, clearSavedRoles } = require('../utils/antiRaidUtils');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;

    try {
      // Slash command handler
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          return interaction.reply({ content: '⚠️ Command not found.', ephemeral: true });
        }

        await command.execute(interaction, client);
      }

      // Button handler
      if (interaction.isButton()) {
        const [action, userId] = interaction.customId.split('_');
        const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!targetMember) return;

        if (action === 'approve') {
          await targetMember.roles.remove('1388991296710115439').catch(() => {});
          await restoreUserRoles(targetMember);
          return interaction.reply({ content: `✅ <@${userId}> has been accepted and their roles have been restored.`, ephemeral: true });
        }

        if (action === 'reject') {
          const modal = new ModalBuilder()
            .setCustomId(`reject_reason_${userId}`)
            .setTitle('Reject Reason')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('reason')
                  .setLabel('Reason for rejection')
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
              )
            );
          return interaction.showModal(modal);
        }
      }

      // Modal submit handler
      if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('reject_reason_')) {
          const userId = interaction.customId.split('_')[2];
          const reason = interaction.fields.getTextInputValue('reason');

          const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
          if (targetMember) {
            await clearSavedRoles(userId);
            await targetMember.kick(reason).catch(() => {});
          }

          return interaction.reply({
            content: `❌ <@${userId}> has been rejected.\n**Reason:** ${reason}`,
            allowedMentions: { users: [userId] },
            ephemeral: false
          });
        }
      }

    } catch (error) {
      console.error(`❌ Error executing ${interaction.commandName || interaction.customId}:`, error);

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: '⚠️ An error occurred while executing this interaction.' });
        } else {
          await interaction.reply({ content: '⚠️ An unexpected error occurred.', ephemeral: true });
        }
      } catch (err) {
        console.error('⚠️ Failed to send error reply:', err);
      }

      await logErrorToChannel(client, error);
    }
  }
};
