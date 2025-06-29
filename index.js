const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./core/db');
const loadEvents = require('./core/loadEvents');
const loadCommands = require('./core/loadCommands');
const { logErrorToChannel } = require('./utils/logError');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.db = db;

// Load commands and events
loadCommands(client);
loadEvents(client);

client.login(process.env.TOKEN);

// Handle uncaught errors
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled Rejection:', error);
  await logErrorToChannel(client, error);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await logErrorToChannel(client, error);
});

// Giveaway monitor — runs every 30 seconds
setInterval(async () => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM giveaways WHERE is_active = 1 AND end_time <= NOW()'
    );

    for (const giveaway of rows) {
      try {
        const channel = await client.channels.fetch(giveaway.channel_id);
        const message = await channel.messages.fetch(giveaway.message_id);
        const reaction = message.reactions.cache.get('🎉');
        const users = await reaction?.users.fetch();

        const entrants = users?.filter(u => !u.bot);
        if (!entrants || entrants.size === 0) {
          await channel.send(`🎉 Giveaway for **${giveaway.prize}** ended, but no one entered.`);
        } else {
          const winners = [...entrants.values()]
            .sort(() => Math.random() - 0.5)
            .slice(0, giveaway.winner_count);
          await channel.send(`🎉 Congratulations ${winners.map(w => `<@${w.id}>`).join(', ')}! You won **${giveaway.prize}**!`);
        }

        await db.query('UPDATE giveaways SET is_active = 0 WHERE message_id = ?', [giveaway.message_id]);
      } catch (err) {
        console.error(`❌ Error finalizing giveaway for message ${giveaway.message_id}:`, err);
        await logErrorToChannel(client, err);
      }
    }
  } catch (err) {
    console.error('❌ Giveaway monitor error:', err);
    await logErrorToChannel(client, err);
  }
}, 30 * 1000); // check every 30 seconds
