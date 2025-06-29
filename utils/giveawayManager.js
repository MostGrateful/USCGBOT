const { EmbedBuilder } = require('discord.js');
const { selectWinners } = require('./giveawayUtils');

module.exports = {
  async checkGiveaways(client) {
    const db = client.db;

    const [rows] = await db.query(
      'SELECT * FROM giveaways WHERE is_active = 1 AND end_time <= NOW()'
    );

    for (const giveaway of rows) {
      const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
      if (!channel) continue;

      const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
      if (!message) continue;

      const reaction = message.reactions.cache.get('🎉');
      if (!reaction) continue;

      const users = await reaction.users.fetch();
      const filtered = users.filter(user => !user.bot);

      if (filtered.size === 0) {
        await channel.send(`🎉 The giveaway for **${giveaway.prize}** ended, but no one entered.`);
      } else {
        const winnerCount = Math.min(filtered.size, giveaway.winner_count);
        const winners = selectWinners(filtered, winnerCount);
        const winnerMentions = winners.map(u => `<@${u.id}>`).join(', ');

        const embed = new EmbedBuilder()
          .setTitle('🎉 Giveaway Ended!')
          .setDescription(`**Prize:** ${giveaway.prize}\n**Winner(s):** ${winnerMentions}`)
          .setColor('Green');

        await channel.send({ embeds: [embed] });
      }

      await db.query('UPDATE giveaways SET is_active = 0 WHERE id = ?', [giveaway.id]);
    }
  }
};

