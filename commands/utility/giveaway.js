const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway')
        .addStringOption(option =>
            option.setName('duration').setDescription('Duration (e.g., 1h, 30m)').setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners').setDescription('Number of winners').setRequired(true))
        .addStringOption(option =>
            option.setName('prize').setDescription('Prize description').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const duration = interaction.options.getString('duration');
        const winnerCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');
        const db = interaction.client.db;

        const endsAt = new Date(Date.now() + ms(duration));
        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway 🎉')
            .setDescription(`**Prize:** ${prize}\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Hosted by:** <@${interaction.user.id}>\nReact with 🎉 to enter!`)
            .setColor('Random');

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('🎉');

        await db.query(
            'INSERT INTO giveaways (message_id, channel_id, guild_id, prize, winner_count, ends_at, host_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [message.id, message.channel.id, interaction.guild.id, prize, winnerCount, endsAt, interaction.user.id]
        );

        console.log(`✅ Giveaway started by ${interaction.user.tag}: ${prize}`);
    }
};

