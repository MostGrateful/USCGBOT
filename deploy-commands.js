const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);
// Gather all commands
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

}
// Use your specific environment variable name
const rest = new REST().setToken(process.env.DiscordTOKEN);
(async () => {
    try {
        console.log(Started refreshing ${commands.length} application (/) commands.);
    const data = await rest.put(
        // Using your CLIENT_ID variable
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
    console.error(error);
}

})();
