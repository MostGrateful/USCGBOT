const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../core/db');
const { selectWinners } = require('../../utils/giveawayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rerollgiveaway')
    .setDescription('Reroll a giveaway to pick new winners')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('The giveaway ID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const id = interaction.options.getInteger('id');
      const [rows] = await db.query('SELECT * FROM giveaways WHERE id = ? AND winners_announced = 1', [id]);

      if (rows.length === 0) {
        return await interaction.editReply({ content: '❌ No ended giveaway found with that ID.' });
      }

      const giveaway = rows[0];
      const channel = await interaction.client.channels.fetch(giveaway.channel_id).catch(() => null);
      if (!channel) return await interaction.editReply({ content: '❌ Channel not found.' });

      const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
      if (!message) return await interaction.editReply({ content: '❌ Message not found.' });

      const reaction = message.reactions.cache.get('🎉');
      const users = await reaction.users.fetch();
      const filteredUsers = users.filter(u => !u.bot);
      const newWinners = selectWinners(filteredUsers, giveaway.winner_count);

      const winnerText = newWinners.length
        ? newWinners.map(w => `<@${w.id}>`).join(', ')
        : 'No valid entries. 😢';

      const rerollEmbed = new EmbedBuilder()
        .setTitle('🎉 Giveaway Rerolled!')
        .setDescription(`**Prize:** ${giveaway.prize}\n**New Winners:** ${winnerText}`)
        .setTimestamp()
        .setColor('Yellow');

      await channel.send({ embeds: [rerollEmbed] });
      await interaction.editReply({ content: `✅ Giveaway rerolled.` });
    } catch (err) {
      console.error('[Slash Command Error - rerollgiveaway.js]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred.' }).catch(() => {});
      }
    }
  },
};
