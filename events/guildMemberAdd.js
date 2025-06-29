const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const { saveUserRoles, removeUserRoles, restoreUserRoles } = require('../utils/antiRaidUtils');
const { getBackgroundCheckEmbed } = require('../utils/backgroundCheckUtils');
const flaggedRoleId = '1388991296710115439';
const webhookURL = 'https://discord.com/api/webhooks/1388991783475744848/fUkxOI0g7TGHZlljCEfPnGqZ7wEPM0Jsy0Vu2cnSDfrK9N9P96sH5-Ug1wzo9u94EPA5';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const accountAgeDays = (Date.now() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const isSuspicious = accountAgeDays < 40;

    if (!isSuspicious) return;

    // Save and remove roles
    await saveUserRoles(member);
    await removeUserRoles(member);
    await member.roles.add(flaggedRoleId);

    const embed = await getBackgroundCheckEmbed(member.user);
    embed.setTitle('🚨 New Suspicious Join Detected');
    embed.setFooter({ text: `Account Age: ${Math.floor(accountAgeDays)} day(s)` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`approve_${member.id}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`reject_${member.id}`).setLabel('❌ Reject').setStyle(ButtonStyle.Danger)
    );

    const res = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '@everyone 🚨 A flagged user has joined!',
        embeds: [embed.toJSON()],
        components: [row.toJSON()]
      })
    });
  }
};


