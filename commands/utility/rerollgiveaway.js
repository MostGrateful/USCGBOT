const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const giveawayUtils = require('../../utils/giveawayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rerollgiveaway')
    .setDescription('Reroll a giveaway winner')
    .addStringOption(opt =>
      opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const db = interaction.client.db;

    const [rows] = await db.query('SELECT * FROM giveaways WHERE message_id = ?', [messageId]);
    if (rows.length === 0) {
      return interaction.reply({ content: 'No giveaway found with that message ID.', ephemeral: true });
    }

    const giveaway = rows[0];
    const channel = await interaction.guild.channels.fetch(giveaway.channel_id);
    const message = await channel.messages.fetch(giveaway.message_id);
    const reaction = message.reactions.cache.get('🎉');
    if (!reaction) return interaction.reply({ content: 'No entries found.', ephemeral: true });

    const users = await reaction.users.fetch();
    users.delete(interaction.client.user.id); // Remove the bot
    if (users.size === 0) return interaction.reply({ content: 'No valid entries found.', ephemeral: true });

    const winners = giveawayUtils.selectWinners(users, giveaway.winner_count);
    const winnerMentions = winners.map(u => `<@${u.id}>`).join(', ');

    await interaction.reply(`🎉 New winner(s): ${winnerMentions}! Congratulations!`);
  }
};
