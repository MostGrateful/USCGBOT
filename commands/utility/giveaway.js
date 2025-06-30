const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../core/db');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a new giveaway.')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setMinValue(1)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setMinValue(1)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // Check for role named "Giveaway prems"
      const hasRole = interaction.member.roles.cache.some(role => role.name.toLowerCase() === 'giveaway prems');
      if (!hasRole) {
        return await interaction.editReply({ content: '❌ You do not have the "Giveaway prems" role.' });
      }

      const prize = interaction.options.getString('prize');
      const winners = interaction.options.getInteger('winners');
      const duration = interaction.options.getInteger('duration');
      const endTime = new Date(Date.now() + duration * 60000);

      const embed = {
        title: '🎉 Giveaway 🎉',
        description: `**Prize:** ${prize}\n**Ends in:** ${duration} minutes\nReact with 🎉 to enter!\n**Winners:** ${winners}`,
        color: 0x00AE86,
        timestamp: endTime,
        footer: { text: `Ends at` },
      };

      const giveawayMessage = await interaction.channel.send({ embeds: [embed] });
      await giveawayMessage.react('🎉');

      // Insert into DB
      await db.query(
        'INSERT INTO giveaways (message_id, channel_id, prize, winner_count, end_time, creator_id, is_active, winners_announced) VALUES (?, ?, ?, ?, ?, ?, 1, 0)',
        [giveawayMessage.id, interaction.channel.id, prize, winners, endTime, interaction.user.id]
      );

      await interaction.editReply({ content: `✅ Giveaway for **${prize}** started successfully!` });

      await sendLogEmbed(client, interaction, `Started a giveaway for **${prize}** with **${winners}** winner(s), lasting **${duration}** minute(s).`);

    } catch (err) {
      console.error('[Slash Command Error]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred while creating the giveaway.' }).catch(() => {});
      }
    }
  },
};
