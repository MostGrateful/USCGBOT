const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const { sendLogEmbed } = require('../../utils/logHelper');
const giveawayUtils = require('../../utils/giveawayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .addStringOption(opt =>
      opt.setName('duration').setDescription('e.g., 1h, 30m').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('winners').setDescription('Number of winners').setRequired(true))
    .addStringOption(opt =>
      opt.setName('prize').setDescription('Prize description').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const allowedRole = '1389007098443993280';
    if (!interaction.member.roles.cache.has(allowedRole)) {
      return interaction.reply({ content: '❌ You do not have permission to start a giveaway.', ephemeral: true });
    }

    const duration = interaction.options.getString('duration');
    const winnerCount = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');
    const db = client.db;

    const endsAt = new Date(Date.now() + ms(duration));
    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway 🎉')
      .setDescription(`**Prize:** ${prize}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\nReact with 🎉 to enter!`)
      .setColor('Random')
      .setFooter({ text: `Giveaway ID will be added after creation.` });

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('🎉');

    const [result] = await db.query(
      'INSERT INTO giveaways (message_id, channel_id, guild_id, prize, winner_count, end_time, host_id, is_active, winners_announced) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)',
      [message.id, message.channel.id, interaction.guild.id, prize, winnerCount, endsAt, interaction.user.id]
    );

    const giveawayId = result.insertId;
    embed.setFooter({ text: `Giveaway ID: ${giveawayId}` });
    await message.edit({ embeds: [embed] });

    await sendLogEmbed(client, interaction, `🎉 Giveaway started for **${prize}** (ID: ${giveawayId})`);
  }
};
