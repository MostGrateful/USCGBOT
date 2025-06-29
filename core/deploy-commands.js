const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// 🔁 Recursively load commands
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
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

// 📁 Ensure "commands" folder exists
const commandsPath = path.join(__dirname, '..', 'commands');
if (!fs.existsSync(commandsPath)) {
    console.error('❌ Commands directory not found! Expected at: /commands');
    process.exit(1);
}

// 🔄 Load all commands
console.log('🔄 Loading slash commands...');
loadCommands(commandsPath);

// 🔐 Validate .env variables
const token = process.env.DiscordTOKEN;
const clientId = process.env.CLIENT_ID;

if (!token) {
    console.error('❌ Missing DiscordTOKEN in .env!');
    process.exit(1);
}
if (!clientId) {
    console.error('❌ Missing CLIENT_ID in .env!');
    process.exit(1);
}

// 🌐 Deploy commands
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`🚀 Registering ${commands.length} slash command(s)...`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ Successfully deployed ${data.length} global slash command(s).`);
    } catch (error) {
        console.error('❌ Deployment failed:', error);

        if (error.code === 50001) {
            console.error('⚠️ Missing Access - Check bot permissions.');
        } else if (error.code === 10013) {
            console.error('⚠️ Unknown Application - Check CLIENT_ID.');
        } else if (error.rawError?.message) {
            console.error('⚠️ Discord API Error:', error.rawError.message);
        }
    }
})();

