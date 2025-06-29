module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`🚀 ${client.user.tag} is online and ready!`);
        console.log(`📊 Loaded ${client.commands.size} slash command(s).`);
        console.log(`🌍 Connected to ${client.guilds.cache.size} server(s).`);
        
        client.user.setActivity('USCG Operations', { type: 3 }); // Type 3 = Watching
    }
};
