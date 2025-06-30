const fs = require('fs');
const path = require('path');

/**
 * Recursively load all slash commands from the commands directory.
 * @param {Client} client - The Discord client instance.
 * @returns {Array} Array of slash command data to register with Discord.
 */
async function loadCommands(client) {
  const commands = [];
  client.commands = new Map();

  const commandsPath = path.join(__dirname, '..', 'commands');

  async function readCommands(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await readCommands(fullPath);
      } else if (file.endsWith('.js')) {
        const command = require(fullPath);
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
        }
      }
    }
  }

  await readCommands(commandsPath);
  return commands;
}

module.exports = { loadCommands };
