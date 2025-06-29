require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const loadCommands = require('./loadCommands');
const path = require('path');

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Command collection
client.commands = new Collection();

// Load commands on startup
(async () => {
  try {
    await loadCommands(client);
    console.log(`✅ Successfully loaded ${client.commands.size} command(s).`);
  } catch (error) {
    console.error('❌ Failed to load commands:', error);
  }
})();

// Bot is ready
client.once('ready', () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  console.log(`🌐 Serving ${client.guilds.cache.size} server(s)`);
});

// Slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log(`❌ Command "/${interaction.commandName}" not found.`);
    return interaction.reply({ content: 'This command no longer exists.', ephemeral: true });
  }

  try {
    await command.execute(interaction, client);
    console.log(`✅ ${interaction.user.tag} executed /${interaction.commandName}`);
  } catch (error) {
    console.error(`❌ Error in /${interaction.commandName}:`, error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.TOKEN);
