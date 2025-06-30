const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Make sure your .env has TOKEN and CLIENT_ID

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔁 Deleting all global application commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    console.log('✅ All global commands deleted.');
  } catch (error) {
    console.error('❌ Error deleting commands:', error);
  }
})();
