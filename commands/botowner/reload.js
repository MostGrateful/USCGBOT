const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const loadCommands = require('../../core/loadCommands');

const ALLOWED_USERS = ['1021175652243751013', '238058962711216130', '559387780606590986'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload a command or all commands')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Command name to reload or "all"')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'reload',
  description: 'Reload a command or all commands.',
  usage: '!reload <command|all>',
  async execute(interactionOrMessage, client) {
    const isInteraction = !!interactionOrMessage.isChatInputCommand;
    const userId = isInteraction ? interactionOrMessage.user.id : interactionOrMessage.author.id;
    const input = isInteraction
      ? interactionOrMessage.options.getString('command')
      : interactionOrMessage.content.split(' ')[1];

    if (!ALLOWED_USERS.includes(userId)) {
      const reply = '❌ You are not authorized to use this command.';
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    if (!input) {
      const reply = '❌ Please specify a command name or "all".';
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    if (input.toLowerCase() === 'all') {
      await loadCommands(client);
      const reply = '✅ All commands reloaded successfully.';
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    const commandName = input.toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
      const reply = `❌ Command \`${commandName}\` not found.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    const commandFoldersPath = path.join(__dirname, '..');
    let commandPath;

    const findCommandFile = (folder) => {
      const folderPath = path.join(commandFoldersPath, folder);
      const commandFilePath = path.join(folderPath, `${commandName}.js`);
      return fs.existsSync(commandFilePath) ? commandFilePath : null;
    };

    const folders = fs.readdirSync(commandFoldersPath);
    for (const folder of folders) {
      const result = findCommandFile(folder);
      if (result) {
        commandPath = result;
        break;
      }
    }

    if (!commandPath) {
      const reply = `❌ Could not locate the file for \`${commandName}\`.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }

    delete require.cache[require.resolve(commandPath)];
    try {
      const newCommand = require(commandPath);
      client.commands.set(newCommand.data?.name || newCommand.name, newCommand);
      const reply = `✅ Successfully reloaded \`${commandName}\`.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    } catch (error) {
      console.error(`❌ Error reloading ${commandName}:`, error);
      const reply = `❌ There was an error while reloading \`${commandName}\`.`;
      return isInteraction
        ? interactionOrMessage.reply({ content: reply, ephemeral: true })
        : interactionOrMessage.reply(reply);
    }
  }
};

