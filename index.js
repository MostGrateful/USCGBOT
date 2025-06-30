require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./core/loadCommands');
const { startGiveawayMonitor } = require('./utils/giveawayMonitor');
const db = require('./core/db');
const fs = require('fs');
const path = require('path');

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Attach DB to client
client.db = db;

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Load commands
(async () => {
  const slashCommands = await loadCommands(client);
  client.slashCommandsData = slashCommands;

  console.log(`📊 Loaded ${slashCommands.length} slash command(s).`);
})();

// Start giveaway monitor
startGiveawayMonitor(client);
console.log('[Giveaway Monitor] Started.');

// Log in bot
client.login(process.env.TOKEN);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

