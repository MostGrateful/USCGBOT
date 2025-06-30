const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');
const db = require('../../core/db');
const { selectWinners } = require('../../utils/giveawayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rerollgiveaway')
    .setDescription('Reroll the winners of a completed giveaway.')
    .addStringOption(option =>
      option.setName('giveaway_id')
        .setDescription('The ID of the giveaway to reroll')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const giveawayId = interaction.options.getString('giveaway_id');

    try {
      const [results] = await db.query('SELECT * FROM giveaways WHERE id = ?', [giveawayId]);
      if (results.length === 0) {
        return await interaction.editReply({ content: '❌ Giveaway not found.' });
      }

      const giveaway = results[0];

      if (giveaway.is_active) {
        return await interaction.editReply({ content: '❌ Giveaway is still active. You can only reroll completed giveaways.' });
      }

      const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
      if (!channel) return await interaction.editReply({ content: '❌ Giveaway channel not found.' });

      const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
      if (!message) return await interaction.editReply({ content: '❌ Giveaway message not found.' });

      const reaction = message.reactions.cache.get('🎉');
      if (!reaction) return await interaction.editReply({ content: '❌ No entries to reroll.' });

      const users = await reaction.users.fetch().catch(() => new Map());
      const filteredUsers = users.filter(u => !u.bot);
      const newWinners = selectWinners(filteredUsers, giveaway.winner_count);

      const winnerText = newWinners.length
        ? newWinners.map(w => `<@${w.id}>`).join(', ')
        : 'No valid entries. 😢';

      const embed = new EmbedBuilder()
        .setTitle('🔁 Giveaway Rerolled!')
        .setDescription(`**Prize:** ${giveaway.prize}\n**New Winners:** ${winnerText}`)
        .setFooter({ text: `Giveaway ID: ${giveaway.id}` })
        .setTimestamp()
        .setColor('Orange');

      await channel.send({ embeds: [embed] });
      await interaction.editReply({ content: '✅ Giveaway rerolled successfully.' });

      await sendLogEmbed(client, interaction, `Rerolled giveaway **${giveaway.id}** (${giveaway.prize}) → Winners: ${winnerText}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ An error occurred while rerolling the giveaway.' });
    }
  },
};
