// index.js
require('ffmpeg-static');

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

// ===== Temporary VC setup =====
const tempVCMap = new Map(); // guildId -> temp channel ID

client.on('voiceStateUpdate', async (oldState, newState) => {
    const guildId = newState.guild.id;
    const tempVCCategoryId = "1489361873915744387"; // Replace with your VC category ID
    const tempVCName = "🎧 Temporary VC";

    // User joins a specific "create temp VC" channel
    if (newState.channelId === "1489359665157505135") {
        const tempChannel = await newState.guild.channels.create({
            name: `${newState.member.user.username}'s VC`,
            type: ChannelType.GuildVoice,
            parent: tempVCCategoryId,
            permissionOverwrites: [
                {
                    id: newState.member.id,
                    allow: ['Connect', 'ManageChannels', 'Speak']
                }
            ]
        });
        tempVCMap.set(guildId, tempChannel.id);
        await newState.member.voice.setChannel(tempChannel);
    }

    // Delete empty temp VC
    if (oldState.channelId && tempVCMap.get(guildId) === oldState.channelId) {
        const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
        if (oldChannel.members.size === 0) {
            oldChannel.delete();
            tempVCMap.delete(guildId);
        }
    }
});

// ===== Welcome message =====
client.on('guildMemberAdd', (member) => {
    const channel = member.guild.systemChannel; // default system channel
    if (channel) {
        channel.send(`👋 Welcome to the server, ${member}!`);
    }
});

// ===== Commands =====
client.on('messageCreate', async (message) => {
    if (!message.guild || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🎵 PLAY COMMAND (temporarily disabled)
    if (command === 'play') {
        message.reply('🎵 Music bot is still ongoing, fixing... -maki');
    }

    // ⏹ STOP COMMAND placeholder (optional)
    if (command === 'stop') {
        message.reply('⏹ Music bot is still ongoing, fixing... - maki');
    }
});

// Load or initialize bot data
let botData = {};
if (fs.existsSync('./botData.json')) {
    botData = JSON.parse(fs.readFileSync('./botData.json'));
}

const rulesMessage = `
➭ Nicknames should be minor-friendly. 

➭ Keep the talk to appropriate channels. Strictly no VC trolling. 

➭ DOXXING IS STRICTLY FORBIDDEN. Leaking pictures, or sharing any personal information without any given consent is considered doxxing. If caught or reported you will be punished.

➭ Don't use offensive language towards anyone who could potentially be sensitive or take offence to it. The rule of thumb should be: if you don't know their boundaries, don't do it. Examples of offensive language are racial slurs and gender slurs. No racist, homophobic, sexist, or otherwise hateful speech or material. THIS SERVER DOES NOT TOLERATE SUCH BEHAVIOUR.

➭ No harassment of other server members. This includes trolling, baiting, inappropriate DMs, reaction spam, bullying, etc. If a member asks you to stop what you are doing to them, then stop.

➭ No posting of advertisements without the approval of the Server Administrators.

➭ No promotion of other servers. 

➭ No inappropriate/NSFW media including profile images.

➭ Treat other people with respect. Be kind and considerate. Not everyone is the same as you; we all have different boundaries.

**1st offense:** Warning  
**2nd offense:** 1 month timeout  
**3rd offense:** Ban
`;

client.on('ready', async () => {
    const rulesChannel = client.channels.cache.get('1490024721021014156'); // <-- Replace with your channel ID

    if (!botData[rulesChannel.id] || !botData[rulesChannel.id].rulesSent) {
        await rulesChannel.send(rulesMessage);

        botData[rulesChannel.id] = { rulesSent: true };
        fs.writeFileSync('./botData.json', JSON.stringify(botData, null, 4));
    }
});


console.log("TOKEN exists?", process.env.TOKEN ? "Yes" : "No");
client.login(process.env.TOKEN);
