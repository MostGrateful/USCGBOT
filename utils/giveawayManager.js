const { EmbedBuilder } = require('discord.js');
const { selectWinners } = require('./giveawayUtils');

/**
 * Ends a giveaway and announces the winners.
 */
async function endGiveaway(client, giveaway, db) {
  try {
    const channel = await client.channels.fetch(giveaway.channel_id);
    const message = await channel.messages.fetch(giveaway.message_id);
    const reaction = message.reactions.cache.get('🎉');
    if (!reaction) return;

    const users = await reaction.users.fetch();
    const eligibleUsers = users.filter(u => !u.bot);
    const winners = selectWinners(eligibleUsers, giveaway.winner_count);

    const resultEmbed = new EmbedBuilder()
      .setTitle('🎉 Giveaway Ended!')
      .setDescription(`**Prize:** ${giveaway.prize}\n**Winners:** ${winners.length > 0 ? winners.map(u => `<@${u.id}>`).join(', ') : 'No valid entries.'}`)
      .setFooter({ text: `Giveaway ID: ${giveaway.id}` })
      .setColor('Blue');

    await message.reply({ embeds: [resultEmbed] });

    await db.query(`UPDATE giveaways SET is_active = 0, winners_announced = 1 WHERE id = ?`, [giveaway.id]);
  } catch (err) {
    console.error(`Failed to end giveaway ${giveaway.id}:`, err);
  }
}

module.exports = { endGiveaway };
