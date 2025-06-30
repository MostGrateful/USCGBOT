const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');
const ms = require('ms');
const db = require('../../core/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a new giveaway')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('How long the giveaway lasts (e.g., 10m, 2h, 1d)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize of the giveaway')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to host the giveaway in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ flags: 64 }); // ephemeral: true replacement

      const durationStr = interaction.options.getString('duration');
      const winnerCount = interaction.options.getInteger('winners');
      const prize = interaction.options.getString('prize');
      const targetChannel = interaction.options.getChannel('channel');

      // Check if channel is accessible
      if (!targetChannel || !targetChannel.send) {
        return await interaction.editReply({
          content: '❌ Unable to access the selected channel. Make sure I have permission to view and send messages in it.'
        });
      }

      const durationMs = ms(durationStr);
      if (!durationMs || durationMs < 10000) {
        return await interaction.editReply({
          content: '❌ Invalid duration. Use formats like `10m`, `1h`, or `2d`.'
        });
      }

      const endTime = new Date(Date.now() + durationMs);
      const giveawayMessage = await targetChannel.send({
        content: `🎉 **GIVEAWAY STARTED** 🎉\nPrize: **${prize}**\nReact with 🎉 to enter!\nEnds <t:${Math.floor(endTime.getTime() / 1000)}:R>`,
      });

      await giveawayMessage.react('🎉');

      await db.query(
        'INSERT INTO giveaways (channel_id, message_id, prize, end_time, winner_count, is_active, winners_announced) VALUES (?, ?, ?, ?, ?, 1, 0)',
        [targetChannel.id, giveawayMessage.id, prize, endTime, winnerCount]
      );

      await interaction.editReply({ content: `✅ Giveaway started in ${targetChannel}` });

      await sendLogEmbed(client, interaction, `Started a giveaway for **${prize}** in ${targetChannel}`);
    } catch (err) {
      console.error('[Slash Command Error - giveaway.js]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', flags: 64 }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred.' }).catch(() => {});
      }
    }
  }
};


