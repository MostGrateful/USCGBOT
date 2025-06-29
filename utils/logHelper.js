const { EmbedBuilder, ChannelType } = require('discord.js');

const DEV_LOG_CHANNEL = '1388955430318768179'; // Bot development server log channel

/**
 * Sends a log embed to the server-specific log channel and also to the central dev log channel.
 * @param {Client} client - The Discord client.
 * @param {CommandInteraction | Message} source - The interaction or message to extract context.
 * @param {string} action - Description of the log event.
 */
async function sendLogEmbed(client, source, action) {
  try {
    const guild = source.guild;
    const user = source.user || source.author;
    const userId = user.id;

    // Fetch server log channel ID from the database
    const [rows] = await client.db.query('SELECT log_channel_id FROM guild_settings WHERE guild_id = ?', [guild.id]);
    const logChannelId = rows.length > 0 ? rows[0].log_channel_id : null;

    const embed = new EmbedBuilder()
      .setTitle('📘 Command Usage Log')
      .setDescription(action)
      .addFields(
        { name: 'Guild', value: `${guild.name} (${guild.id})`, inline: false },
        { name: 'User', value: `${user.tag} (${userId})`, inline: false }
      )
      .setColor('Blue')
      .setTimestamp()
      .setFooter({ text: `User ID: ${userId}` });

    // Send to guild-specific log channel
    if (logChannelId) {
      const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
      if (logChannel && logChannel.type === ChannelType.GuildText) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    // Send to central dev log channel
    const devLogChannel = await client.channels.fetch(DEV_LOG_CHANNEL).catch(() => null);
    if (devLogChannel && devLogChannel.type === ChannelType.GuildText) {
      await devLogChannel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Failed to send log embed:', err);
  }
}

module.exports = { sendLogEmbed };
