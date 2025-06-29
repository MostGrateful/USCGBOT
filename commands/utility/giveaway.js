const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const giveawayManager = require('../../utils/giveawayManager');

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

  async execute(interaction) {
    const duration = interaction.options.getString('duration');
    const winnerCount = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');
    const db = interaction.client.db;

    // ✅ Set endsAt here
    const endsAt = new Date(Date.now() + ms(duration));

    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway 🎉')
      .setDescription(`**Prize:** ${prize}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\nReact with 🎉 to enter!`)
      .setColor('Random');

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('🎉');

    await db.query(
      'INSERT INTO giveaways (message_id, channel_id, guild_id, prize, winner_count, end_time, host_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [
        message.id,
        message.channel.id,
        interaction.guild.id,
        prize,
        winnerCount,
        endsAt, // 👈 this will be stored in DATETIME format
        interaction.user.id
      ]
    );

    console.log(`✅ Giveaway started by ${interaction.user.tag}: ${prize}`);
  }
};
