module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`[DEBUG] Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      console.log(`[DEBUG] Running command: ${interaction.commandName}`);
      await command.execute(interaction, client);
    } catch (err) {
      console.error(`[COMMAND ERROR] ${interaction.commandName}:`, err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ An error occurred while executing this command.',
          ephemeral: true
        }).catch(console.error);
      } else {
        await interaction.editReply({
          content: '❌ An error occurred during command execution.',
        }).catch(console.error);
      }
    }
  },
};

