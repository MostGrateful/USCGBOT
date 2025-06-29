const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
  client.commands = new Map(); // or Collection if preferred
  const commandsPath = path.join(__dirname, '..', 'commands');

  const load = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        load(filePath);
      } else if (file.endsWith('.js')) {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          console.log(`✅ Loaded command: ${command.data.name}`);
        } else {
          console.log(`⚠️ Skipped ${filePath}: Missing "data" or "execute"`);
        }
      }
    }
  };

  load(commandsPath);
};
