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

client.login('MTQ4OTM0MTA3NzE4MDc3NjQ2OA.G2wpnT.OdfHy3ZOCov-6V2saVPsChfLKTPKCpDy2EQHr4');