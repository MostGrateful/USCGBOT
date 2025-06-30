const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../core/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancelgiveaway')
    .setDescription('Cancel an active giveaway')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('The ID of the giveaway to cancel')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const giveawayId = interaction.options.getInteger('id');
      const [rows] = await db.query('SELECT * FROM giveaways WHERE id = ? AND is_active = 1', [giveawayId]);

      if (rows.length === 0) {
        return await interaction.editReply({ content: '❌ No active giveaway found with that ID.' });
      }

      await db.query('UPDATE giveaways SET is_active = 0, winners_announced = 1 WHERE id = ?', [giveawayId]);

      await interaction.editReply({ content: `✅ Giveaway ID \`${giveawayId}\` has been cancelled.` });
    } catch (err) {
      console.error('[Slash Command Error - cancelgiveaway.js]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.editReply({ content: '❌ An error occurred.' }).catch(() => {});
      }
    }
  },
};






