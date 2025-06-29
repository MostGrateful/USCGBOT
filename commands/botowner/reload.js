const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { sendLogEmbed } = require('../../utils/logHelper');

const OWNER_IDS = ['1021175652243751013', '238058962711216130', '559387780606590986'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload one or all bot commands')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The name of the command to reload (leave blank for all)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'reload',
  description: 'Reload one or all bot commands (prefix)',
  async execute(interaction, client) {
    if (!OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
    }

    const commandName = interaction.options?.getString('command');

    if (!commandName) {
      // Reload all
      try {
        client.commands.clear();
        const { loadCommands } = require('../../core/loadCommands');
        await loadCommands(client);
        await interaction.reply({ content: '✅ All commands reloaded successfully.' });
        await sendLogEmbed(client, interaction, 'Reloaded **all** commands.');
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Failed to reload all commands.' });
      }
    } else {
      // Reload specific command
      const command = client.commands.get(commandName);
      if (!command) {
        return interaction.reply({ content: `❌ Command \`${commandName}\` not found.`, ephemeral: true });
      }

      const commandPath = path.join(__dirname, '..', command.category || '', `${commandName}.js`);
      try {
        delete require.cache[require.resolve(commandPath)];
        const newCommand = require(commandPath);
        client.commands.set(newCommand.data.name || newCommand.name, newCommand);
        await interaction.reply({ content: `✅ Reloaded \`${commandName}\` command.` });
        await sendLogEmbed(client, interaction, `Reloaded command: \`${commandName}\``);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: `❌ Error reloading \`${commandName}\`.`, ephemeral: true });
      }
    }
  },

  // Prefix version
  async run(message, args, client) {
    if (!OWNER_IDS.includes(message.author.id)) return;

    const commandName = args[0];

    if (!commandName) {
      try {
        client.commands.clear();
        const { loadCommands } = require('../../core/loadCommands');
        await loadCommands(client);
        return message.reply('✅ All commands reloaded.');
      } catch (err) {
        console.error(err);
        return message.reply('❌ Failed to reload all commands.');
      }
    } else {
      const command = client.commands.get(commandName);
      if (!command) {
        return message.reply(`❌ Command \`${commandName}\` not found.`);
      }

      const commandPath = path.join(__dirname, '..', command.category || '', `${commandName}.js`);
      try {
        delete require.cache[require.resolve(commandPath)];
        const newCommand = require(commandPath);
        client.commands.set(newCommand.data.name || newCommand.name, newCommand);
        await sendLogEmbed(client, message, `Reloaded command (prefix): \`${commandName}\``);
        return message.reply(`✅ Reloaded \`${commandName}\` command.`);
      } catch (err) {
        console.error(err);
        return message.reply(`❌ Error reloading \`${commandName}\`.`);
      }
    }
  }
};
