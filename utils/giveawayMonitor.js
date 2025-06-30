const { EmbedBuilder } = require('discord.js');
const db = require('../core/db');
const { selectWinners } = require('./giveawayUtils');

async function startGiveawayMonitor(client) {
  console.log('[Giveaway Monitor] Started.');

  setInterval(async () => {
    console.log('[Giveaway Monitor] Checking for ended giveaways...');

    const [rows] = await db.query(
      'SELECT * FROM giveaways WHERE is_active = 1 AND winners_announced = 0 AND end_time <= NOW()'
    );

    if (!rows.length) {
      console.log('[Giveaway Monitor] No ended giveaways found.');
      return;
    }

    for (const giveaway of rows) {
      try {
        const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
        if (!channel) continue;

        const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
        if (!message) continue;

        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) {
          await channel.send(`❌ No entries found for giveaway **${giveaway.prize}**.`);
          await db.query('UPDATE giveaways SET winners_announced = 1, is_active = 0 WHERE id = ?', [giveaway.id]);
          continue;
        }

        const users = await reaction.users.fetch().catch(() => new Map());
        const filteredUsers = users.filter(u => !u.bot);
        const winners = selectWinners(filteredUsers, giveaway.winner_count);

        const winnerText = winners.length
          ? winners.map(w => `<@${w.id}>`).join(', ')
          : 'No valid entries. 😢';

        const embed = new EmbedBuilder()
          .setTitle('🎉 Giveaway Ended! 🎉')
          .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winnerText}`)
          .setFooter({ text: `Giveaway ID: ${giveaway.id}` })
          .setTimestamp()
          .setColor('Green');

        await channel.send({ embeds: [embed] });

        await db.query('UPDATE giveaways SET winners_announced = 1, is_active = 0 WHERE id = ?', [giveaway.id]);

        console.log(`[Giveaway Monitor] Giveaway ID ${giveaway.id} ended and winners announced.`);
      } catch (err) {
        console.error(`❌ Error finalizing giveaway ID ${giveaway.id}:`, err);
      }
    }
  }, 30 * 1000); // check every 30 seconds
}

module.exports = { startGiveawayMonitor };
