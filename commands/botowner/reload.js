const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The name of the command to reload')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const commandName = interaction.options.getString('command').toLowerCase();
      const command = client.commands.get(commandName);

      if (!command) {
        return await interaction.editReply({ content: `❌ No command found with name \`${commandName}\`.` });
      }

      const commandPath = require.resolve(`../../commands/${command.category}/${command.data.name}.js`);
      delete require.cache[commandPath];

      const newCommand = require(commandPath);
      client.commands.set(newCommand.data.name, newCommand);

      await interaction.editReply({ content: `✅ Command \`${commandName}\` was reloaded successfully.` });
      await sendLogEmbed(client, interaction, `Reloaded command \`${commandName}\`.`);
    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred while reloading the command.' }).catch(() => {});
      }
    }
  },
};


