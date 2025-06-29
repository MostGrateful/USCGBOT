const { EmbedBuilder } = require('discord.js');
const { selectWinners } = require('./giveawayUtils');

async function monitorGiveaways(client) {
  const db = client.db;

  setInterval(async () => {
    const [giveaways] = await db.query(
      'SELECT * FROM giveaways WHERE is_active = 1 AND end_time <= NOW()'
    );

    for (const giveaway of giveaways) {
      try {
        const channel = await client.channels.fetch(giveaway.channel_id);
        const message = await channel.messages.fetch(giveaway.message_id);
        const reaction = message.reactions.cache.get('🎉');

        if (!reaction) continue;

        const users = await reaction.users.fetch();
        const filteredUsers = users.filter(u => !u.bot);
        const winners = selectWinners(filteredUsers, giveaway.winner_count);

        let winnerText;
        if (winners.length === 0) {
          winnerText = 'No valid entries. 😢';
        } else {
          winnerText = winners.map(u => `<@${u.id}>`).join(', ');
        }

        const embed = EmbedBuilder.from(message.embeds[0])
          .setFooter({ text: '🎉 Giveaway Ended' })
          .setColor('Green');

        await message.edit({
          embeds: [embed],
          content: `🎊 **Giveaway Ended!**\nPrize: **${giveaway.prize}**\nWinners: ${winnerText}`,
          components: [],
        });

        // Remove giveaway from DB
        await db.query('DELETE FROM giveaways WHERE id = ?', [giveaway.id]);

        console.log(`✅ Giveaway ${giveaway.id} finished and removed from DB.`);
      } catch (err) {
        console.error(`❌ Error processing giveaway ${giveaway.id}:`, err);
      }
    }
  }, 15 * 1000); // Check every 15 seconds
}

module.exports = { monitorGiveaways };

