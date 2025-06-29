module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error executing ${interaction.commandName}:`, error);

      try {
        await interaction.reply({
          content: 'There was an error while executing this command.',
          ephemeral: true,
        });
      } catch {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: 'An error occurred.', components: [] });
        }
      }

      const { logErrorToChannel } = require('../utils/logError');
      await logErrorToChannel(client, error, interaction.commandName);
    }
  },
};
