const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const giveawayUtils = require('../../utils/giveawayUtils');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rerollgiveaway')
    .setDescription('Reroll a giveaway to select new winner(s)')
    .addStringOption(opt =>
      opt.setName('id').setDescription('Giveaway ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const id = interaction.options.getString('id');
    const db = client.db;

    const [rows] = await db.query('SELECT * FROM giveaways WHERE id = ?', [id]);
    if (!rows.length) return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });

    const giveaway = rows[0];
    const channel = await client.channels.fetch(giveaway.channel_id);
    const message = await channel.messages.fetch(giveaway.message_id);
    const winners = await giveawayUtils.selectWinners(message, giveaway.winner_count);

    if (!winners.length) {
      return interaction.reply('❌ No valid users to select from.');
    }

    await channel.send(`🔁 New winner(s) for **${giveaway.prize}**: ${winners.map(u => `<@${u.id}>`).join(', ')}`);
    await interaction.reply(`✅ Rerolled giveaway **${giveaway.prize}** (ID: ${id})`);

    await sendLogEmbed(client, interaction, `🔁 Rerolled giveaway (ID: ${id})`);
  }
};

