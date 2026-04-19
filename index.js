const { Client, GatewayIntentBits } = require('discord.js');

// Import events and handlers
const voiceStateUpdate = require('./events/voiceStateUpdate');
const guildMemberAdd = require('./events/guildMemberAdd');
const clientReady = require('./events/clientReady');
const messageCreate = require('./events/messageCreate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== EVENT LISTENERS =====
client.on('voiceStateUpdate', voiceStateUpdate);
client.on('guildMemberAdd', guildMemberAdd);
client.once('clientReady', () => clientReady(client));
client.on('messageCreate', messageCreate);

// ===== LOGIN =====
client.login(process.env.TOKEN);
