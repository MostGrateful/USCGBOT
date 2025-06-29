const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const commands = [];
// Function to load commands recursively
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
        // Recursively load commands from subdirectories
        loadCommands(filePath);
    } else if (file.endsWith('.js')) {
        try {
            const command = require(filePath);
            if (command.data && typeof command.data.toJSON === 'function') {
                commands.push(command.data.toJSON());
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Skipping ${file}: Missing valid command data`);
            }
        } catch (error) {
            console.error(`❌ Error loading ${file}:`, error.message);
        }
    }
}

}
// Check if commands directory exists
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
    console.error('❌ Commands directory not found! Please create a "commands" folder.');
    process.exit(1);
}
// Load all commands
console.log('🔄 Loading commands...');
loadCommands(commandsPath);
// Validate environment variables
if (!process.env.DiscordTOKEN) {
    console.error('❌ DiscordTOKEN not found in .env file!');
    process.exit(1);
}
if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID not found in .env file!');
    process.exit(1);
}
// Create REST instance
const rest = new REST({ version: '10' }).setToken(process.env.DiscordTOKEN);
// Deploy commands
(async () => {
    try {
 console.log(🚀 Started refreshing ${commands.length} application (/) commands.);
    // Deploy globally (available in all servers)
    const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands globally.`);
    
} catch (error) {
    console.error('❌ Error deploying commands:', error);
    
    // More specific error handling
    if (error.code === 50001) {
        console.error('Missing Access - Check your bot permissions');
    } else if (error.code === 10013) {
        console.error('Unknown Application - Check your CLIENT_ID');
    } else if (error.rawError?.message) {
        console.error('Discord API Error:', error.rawError.message);
    }
}

})();
