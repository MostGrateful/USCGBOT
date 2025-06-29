const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

// Attach SQL (if used)
const db = require('./core/db');
client.db = db;

// Initialize command collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.warn(`⚠️ Invalid command file: ${file}`);
            }
        }
    }
}
if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
} else {
    console.warn('⚠️ No commands folder found. Creating one...');
    fs.mkdirSync(commandsPath);
}

// Load events
const loadEvents = require('./core/loadEvents');
loadEvents(client);

// Ready log
client.once('ready', () => {
    console.log(`🚀 ${client.user.tag} is online!`);
    console.log(`📦 ${client.commands.size} commands loaded.`);
});

// Slash command interaction handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.warn(`❌ Unknown command: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction, client);
        console.log(`✅ ${interaction.user.tag} used /${interaction.commandName}`);
    } catch (error) {
        console.error(`❌ Error executing ${interaction.commandName}:`, error);
        const reply = { content: 'An error occurred while executing this command.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
});

// Handle errors
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err));
client.on('error', err => console.error('Client Error:', err));

// Login bot
client.login(process.env.TOKEN);
