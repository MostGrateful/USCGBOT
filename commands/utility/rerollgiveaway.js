const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { pickWinners, formatWinners } = require('../../utils/giveawayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rerollgiveaway')
        .setDescription('Reroll the winners of a finished giveaway')
        .addStringOption(option =>
            option.setName('message_id').setDescription('Message ID of the giveaway to reroll').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const db = interaction.client.db;

        const [rows] = await db.query('SELECT * FROM giveaways WHERE message_id = ? AND is_active = 0', [messageId]);
        const giveaway = rows[0];

        if (!giveaway) {
            return interaction.reply({ content: '❌ Giveaway not found or is still active.', ephemeral: true });
        }

        const channel = await interaction.client.channels.fetch(giveaway.channel_id);
        const message = await channel.messages.fetch(giveaway.message_id);

        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) {
            return interaction.reply({ content: '❌ No 🎉 reactions found.', ephemeral: true });
        }

        const users = await reaction.users.fetch();
        const validUsers = users.filter(u => !u.bot);

        const winners = pickWinners([...validUsers.values()], giveaway.winner_count);
        const resultMessage = formatWinners(winners, giveaway.prize);

        await channel.send(`🔁 **Reroll Result:**\n${resultMessage}`);
        await interaction.reply({ content: '✅ Rerolled the giveaway.', ephemeral: true });
    }
};
