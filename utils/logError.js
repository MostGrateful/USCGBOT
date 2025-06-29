// utils/logError.js
const { EmbedBuilder } = require('discord.js');

const ERROR_LOG_CHANNEL_ID =1388955446148206602; // Replace with your channel ID

async function logErrorToChannel(client, error, commandName = 'Unknown') {
  const channel = await client.channels.fetch(ERROR_LOG_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle('❌ Bot Error')
    .setColor('Red')
    .addFields(
      { name: 'Command', value: commandName },
      { name: 'Error', value: `\`\`\`${error.message || error}\`\`\`` }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = { logErrorToChannel };
