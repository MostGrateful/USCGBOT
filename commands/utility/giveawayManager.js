const { EmbedBuilder } = require('discord.js');

async function checkGiveaways(client) {
    const db = client.db;

    try {
        const [giveaways] = await db.query(
            'SELECT * FROM giveaways WHERE is_active = 1 AND ends_at <= NOW()'
        );

        for (const giveaway of giveaways) {
            try {
                const channel = await client.channels.fetch(giveaway.channel_id);
                const message = await channel.messages.fetch(giveaway.message_id);

                const reaction = message.reactions.cache.get('🎉');
                if (!reaction) continue;

                const users = await reaction.users.fetch();
                const validUsers = users.filter(user => !user.bot);
                const userArray = [...validUsers.values()];

                const winners = [];
                while (winners.length < giveaway.winner_count && userArray.length > 0) {
                    const winner = userArray.splice(Math.floor(Math.random() * userArray.length), 1)[0];
                    winners.push(winner);
                }

                let resultMessage = '';
                if (winners.length === 0) {
                    resultMessage = 'No valid entries, no winners could be chosen.';
                } else {
                    resultMessage = `🎉 Congratulations ${winners.map(w => `<@${w.id}>`).join(', ')}! You won **${giveaway.prize}**!`;
                }

                // Edit giveaway message to mark as ended
                await message.edit({
                    content: `🎉 **GIVEAWAY ENDED** 🎉\n\n**Prize:** ${giveaway.prize}\n**Hosted by:** <@${giveaway.host_id}>`,
                });

                // Announce winner(s)
                await channel.send(resultMessage);

                // Mark giveaway as inactive
                await db.query('UPDATE giveaways SET is_active = 0 WHERE message_id = ?', [giveaway.message_id]);

            } catch (err) {
                console.error(`❌ Failed to process giveaway ${giveaway.message_id}:`, err);
            }
        }

    } catch (error) {
        console.error('❌ Error checking giveaways:', error);
    }
}
