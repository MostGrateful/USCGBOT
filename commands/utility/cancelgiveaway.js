const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancelgiveaway')
        .setDescription('Cancel a giveaway')
        .addStringOption(option =>
            option.setName('message_id').setDescription('The message ID of the giveaway to cancel').setRequired(true)),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const db = interaction.client.db;

        const [rows] = await db.query('SELECT * FROM giveaways WHERE message_id = ? AND is_active = 1', [messageId]);
        const giveaway = rows[0];

        if (!giveaway) {
            return interaction.reply({ content: '❌ Giveaway not found or already ended.', ephemeral: true });
        }

        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (giveaway.host_id !== interaction.user.id && !isAdmin) {
            return interaction.reply({ content: '❌ You are not allowed to cancel this giveaway.', ephemeral: true });
        }

        await db.query('UPDATE giveaways SET is_active = 0 WHERE message_id = ?', [messageId]);

        try {
            const channel = await interaction.client.channels.fetch(giveaway.channel_id);
            const message = await channel.messages.fetch(giveaway.message_id);
            await message.edit({ content: '❌ This giveaway has been cancelled.', embeds: [] });
        } catch (err) {
            console.warn(`⚠️ Could not edit message: ${err.message}`);
        }

        await interaction.reply({ content: '✅ Giveaway successfully cancelled.', ephemeral: true });
    }
};
