const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLogEmbed } = require('../../utils/logHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancelgiveaway')
    .setDescription('Cancel an active giveaway')
    .addStringOption(opt =>
      opt.setName('id').setDescription('The ID of the giveaway to cancel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const db = client.db;
    const id = interaction.options.getString('id');

    const [rows] = await db.query('SELECT * FROM giveaways WHERE id = ?', [id]);
    if (!rows.length) return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });

    const giveaway = rows[0];
    await db.query('DELETE FROM giveaways WHERE id = ?', [id]);

    await interaction.reply(`✅ Giveaway **${giveaway.prize}** (ID: ${id}) has been cancelled and removed.`);
    await sendLogEmbed(client, interaction, `❌ Giveaway cancelled (ID: ${id})`);
  }
};




