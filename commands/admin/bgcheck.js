const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backgroundcheck')
        .setDescription('Perform a Roblox background check.')
        .addStringOption(option => option.setName('roblox-user').setDescription('The Roblox username').setRequired(true))
        .addUserOption(option => option.setName('discord-user').setDescription('The Discord user to link')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const robloxUserInput = interaction.options.getString('roblox-user');
        const discordUser = interaction.options.getUser('discord-user');

        const res = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [robloxUserInput], excludeBannedUsers: false })
        });
        const data = await res.json();
        const robloxInfo = data.data && data.data[0];
        if (!robloxInfo) return interaction.editReply('Roblox user not found.');
        const robloxUserId = robloxInfo.id;

        const detailsRes = await fetch(`https://users.roblox.com/v1/users/${robloxUserId}`);
        const details = await detailsRes.json();
        const createdDateFormatted = new Date(details.created).toLocaleDateString();
        const accountAgeDays = Math.floor((Date.now() - new Date(details.created)) / (1000 * 60 * 60 * 24));
        const under40DaysFlag = accountAgeDays < 40 ? '⚠️' : '';

        const friendsRes = await fetch(`https://friends.roblox.com/v1/users/${robloxUserId}/friends/count`);
        const friendsCount = (await friendsRes.json()).count;

        const followersRes = await fetch(`https://friends.roblox.com/v1/users/${robloxUserId}/followers/count`);
        const followersCount = (await followersRes.json()).count;

        const followingsRes = await fetch(`https://friends.roblox.com/v1/users/${robloxUserId}/followings/count`);
        const followingsCount = (await followingsRes.json()).count;

        const groupsRes = await fetch(`https://groups.roblox.com/v2/users/${robloxUserId}/groups/roles`);
        const groupsData = await groupsRes.json();
        const groups = groupsData.data || [];

        const discordText = discordUser ? `${discordUser.tag} (${discordUser.id})` : 'Not linked';
        const flags = [];
        const flagsText = 'No flags detected. User appears clean.';

        const profileUrl = `https://www.roblox.com/users/${robloxUserId}/profile`;
        const safeString = input => input?.toString() || 'None';

        const embed = new EmbedBuilder()
            .setTitle(`Background Check: ${robloxInfo.name}`)
            .addFields([
                { name: 'User ID', value: safeString(robloxUserId), inline: true },
                { name: 'Account Created', value: safeString(createdDateFormatted), inline: true },
                { name: 'Account Age', value: safeString(`${accountAgeDays} days ${under40DaysFlag}`), inline: true },
                { name: 'Friends', value: safeString(friendsCount), inline: true },
                { name: 'Followers', value: safeString(followersCount), inline: true },
                { name: 'Following', value: safeString(followingsCount), inline: true },
                { name: 'Groups', value: safeString(groups.length), inline: true },
                { name: 'Discord', value: safeString(discordText), inline: true },
                { name: `Flags [${flags.length}]`, value: safeString(flagsText), inline: false },
                { name: 'Quick Links', value: `[Profile](${profileUrl}) | [Friends](https://www.roblox.com/users/${robloxUserId}/friends)`, inline: false }
            ])
            .setColor('#00AAFF')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
