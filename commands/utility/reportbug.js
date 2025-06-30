const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reportbug')
    .setDescription('Report a bug about the Discord bot.'),

  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('bugReportModal')
      .setTitle('🐞 Report a Bug');

    const whenInput = new TextInputBuilder()
      .setCustomId('bug_when')
      .setLabel('When did the bug happen?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descInput = new TextInputBuilder()
      .setCustomId('bug_desc')
      .setLabel('Describe the bug')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const screenshotInput = new TextInputBuilder()
      .setCustomId('bug_screenshot')
      .setLabel('Screenshots (Links only)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const recreateInput = new TextInputBuilder()
      .setCustomId('bug_recreate')
      .setLabel('Can the bug be recreated?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(whenInput),
      new ActionRowBuilder().addComponents(descInput),
      new ActionRowBuilder().addComponents(screenshotInput),
      new ActionRowBuilder().addComponents(recreateInput),
    );

    await interaction.showModal(modal);
  },
};
