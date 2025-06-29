const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const db = require('./core/db');
const loadEvents = require('./core/loadEvents');
const loadCommands = require('./core/loadCommands');
const { logErrorToChannel } = require('./utils/logError');
const { startGiveawayMonitor } = require('./utils/giveawayMonitor');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.db = db;

// Load all commands and events
loadCommands(client);
loadEvents(client);

// Start monitoring giveaways
startGiveawayMonitor(client);

// Log in
client.login(process.env.TOKEN);

// Global error handling
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled Rejection:', error);
  await logErrorToChannel(client, error);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await logErrorToChannel(client, error);
});
