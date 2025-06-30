const { EmbedBuilder } = require('discord.js');
const db = require('../core/db'); // Adjust path if needed
const { selectWinners } = require('./giveawayUtils');

async function startGiveawayMonitor(client) {
  console.log('[Giveaway Monitor] Started.');

  setInterval(async () => {
    try {
      console.log('[Giveaway Monitor] Checking for ended giveaways...');

      const [rows] = await db.query(
        'SELECT * FROM giveaways WHERE is_active = 1 AND winners_announced = 0 AND end_time <= NOW()'
      );

      if (rows.length === 0) {
        console.log('[Giveaway Monitor] No ended giveaways found.');
        return;
      }

      for (const giveaway of rows) {
        console.log(`[Giveaway Monitor] Processing giveaway ID ${giveaway.id}`);

        const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
        if (!channel) {
          console.warn(`[Giveaway Monitor] Channel not found: ${giveaway.channel_id}`);
          continue;
        }

        const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
        if (!message) {
          console.warn(`[Giveaway Monitor] Message not found: ${giveaway.message_id}`);
          continue;
        }

        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) {
          console.log(`[Giveaway Monitor] No 🎉 reactions found for giveaway ID ${giveaway.id}`);
          await channel.send(`❌ No entries for giveaway **${giveaway.prize}**.`);
          await db.query('UPDATE giveaways SET winners_announced = 1, is_active = 0 WHERE id = ?', [giveaway.id]);
          continue;
        }

        const users = await reaction.users.fetch().catch(() => new Map());
        const filteredUsers = users.filter(u => !u.bot);
        const winners = selectWinners(filteredUsers, giveaway.winner_count);

        console.log(`[Giveaway Monitor] Winners selected:`, winners.map(u => u.tag || u.id));

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
        console.log(`[Giveaway Monitor] Giveaway ID ${giveaway.id} marked as completed.`);
      }
    } catch (err) {
      console.error('[Giveaway Monitor] Fatal error:', err);
    }
  }, 30 * 1000); // Runs every 30 seconds
}

module.exports = { startGiveawayMonitor };
