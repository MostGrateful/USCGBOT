module.exports = {
  name: 'flagnotice',
  description: 'Send a flag notification for a user to the designated review channel',
  async run(message, args, client) {
    // Check for permissions
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ You do not have permission to use this command.');
    }

    // Get the mentioned user
    const user = message.mentions.members.first();
    if (!user) {
      return message.reply('❌ Please mention a user to notify.');
    }

    // Target review channel
    const channel = client.channels.cache.get('1389002585746313308');
    if (!channel) {
      return message.reply('❌ Review channel not found.');
    }

    // Role to assign
    const flaggedRole = message.guild.roles.cache.get('1388991296710115439');
    if (flaggedRole && !user.roles.cache.has(flaggedRole.id)) {
      await user.roles.add(flaggedRole).catch(() => {});
    }

    // Embed message
    const embed = {
      title: '**Your account has been flagged**',
      description:
        'Your account has been flagged by our system. A member of our community staff will review your account and decide if it meets our standards.\n\nIf accepted, access will be restored. If rejected, you’ll be removed from the server.\n\n⚠️ **Attempts to bypass this system will result in permanent bans.**',
      color: 0x2f3136, // Discord dark theme match
      thumbnail: {
        url: 'https://i.ibb.co/r2qdBWV5/USCG.webp',
      },
      timestamp: new Date(),
    };

    await channel.send({
      content: `${user}`,
      embeds: [embed],
    });

    message.reply(`✅ Flag notice sent for ${user.user.tag}.`);
  },
};


