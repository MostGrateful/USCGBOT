// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const db = require('./db'); // MySQL connection
const path = require('path');
const fs = require('fs');

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Ready event
client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);

  // Test DB connection
  try {
    const [rows] = await db.query('SELECT NOW() AS time');
    console.log('🗃️ Connected to MySQL. Server time:', rows[0].time);
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
  }
});

// Basic message command (temporary testing)
client.on('messageCreate', async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

// Log in with bot token
client.login(process.env.TOKEN);

