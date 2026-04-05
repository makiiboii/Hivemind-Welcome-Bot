// index.js

const { Client, GatewayIntentBits, ChannelType, EmbedBuilder } = require('discord.js');

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

// ===== CONFIG =====
const CREATE_CHANNEL_ID = "1489359665157505135"; // join to create VC
const CATEGORY_ID = "1489361873915744387"; // VC category
const WELCOME_CHANNEL_ID = "1489339572738588962"; // server welcome
const RULES_CHANNEL_ID = "1490024721021014156"; // server rules

// ===== TEMP VC SYSTEM =====
const tempVCs = new Map(); // channelId -> ownerId
const sentHelp = new Set();

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    // 🔥 CREATE TEMP VC
    if (newState.channelId === CREATE_CHANNEL_ID) {
      const tempChannel = await newState.guild.channels.create({
        name: `${newState.member.user.username}'s VC`,
        type: ChannelType.GuildVoice,
        parent: CATEGORY_ID,
        userLimit: 0
      });

      tempVCs.set(tempChannel.id, newState.member.id);
      await newState.setChannel(tempChannel);

      // 🎨 Modern VC welcome embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FFFF')
        .setTitle(`👋 Welcome ${newState.member.user.username}!`)
        .setDescription(`
🎛️ **VC Commands:**
\`!limit [1-99]\`
\`!lock\`
\`!unlock\`
\`!name [name]\`
        `)
        .setThumbnail(newState.member.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Enjoy your VC!' })
        .setTimestamp();

      tempChannel.send({ embeds: [welcomeEmbed] }).catch(() => {});
    }

    // 🧹 DELETE EMPTY VC
    if (oldState.channelId && tempVCs.has(oldState.channelId)) {
      const channel = oldState.guild.channels.cache.get(oldState.channelId);
      if (channel && channel.members.size === 0) {
        await channel.delete().catch(() => {});
        tempVCs.delete(oldState.channelId);
      }
    }

    // 💬 SEND HELP WHEN JOINING VC
    if (!oldState.channel && newState.channel) {
      const vc = newState.channel;
      if (tempVCs.has(vc.id)) {
        const key = `${newState.member.id}-${vc.id}`;
        if (sentHelp.has(key)) return;

        sentHelp.add(key);

        const helpEmbed = new EmbedBuilder()
          .setColor('#7CFC00')
          .setTitle(`🎛️ VC Commands`)
          .setDescription(`
\`!limit [1-99]\` – Set max users  
\`!lock\` – Lock VC  
\`!unlock\` – Unlock VC  
\`!name [new name]\` – Rename VC
          `)
          .setThumbnail(newState.member.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: 'Tip: Only VC owner can change settings' })
          .setTimestamp();

        vc.send({ embeds: [helpEmbed] }).catch(() => {});
      }
    }

  } catch (err) {
    console.error("VC Error:", err);
  }
});

// ===== SERVER WELCOME MESSAGE =====
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle(`🎉 Welcome ${member.user.username} to the server!`)
    .setDescription(`We hope you enjoy your stay! Check out the channels and commands.`)
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Your friendly server bot' })
    .setTimestamp();

  channel.send({ embeds: [welcomeEmbed] });
});

// ===== COMMANDS =====
client.on('messageCreate', async (message) => {
  if (!message.guild || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const vc = message.member.voice.channel;

  // ❌ must be in VC
  if (!vc) return message.reply('❌ Join a VC first');

  // ❌ must be temp VC
  if (!tempVCs.has(vc.id)) return;

  // ❌ must be owner
  if (tempVCs.get(vc.id) !== message.member.id) {
    return message.reply('❌ Only owner can use this');
  }

  // ===== LIMIT =====
  if (command === 'limit') {
    const limit = parseInt(args[0]);
    if (isNaN(limit) || limit < 0 || limit > 99) {
      return message.reply('❌ Enter 0-99');
    }
    await vc.setUserLimit(limit);
    return message.reply(`✅ Limit set to ${limit}`);
  }

  // ===== LOCK =====
  if (command === 'lock') {
    await vc.permissionOverwrites.edit(message.guild.roles.everyone, {
      Connect: false
    });
    return message.reply('🔒 VC locked');
  }

  // ===== UNLOCK =====
  if (command === 'unlock') {
    await vc.permissionOverwrites.edit(message.guild.roles.everyone, {
      Connect: true
    });
    return message.reply('🔓 VC unlocked');
  }

  // ===== RENAME =====
  if (command === 'name') {
    const newName = args.join(' ');
    if (!newName) return message.reply('❌ Enter a name');

    await vc.setName(newName);
    return message.reply(`✅ Renamed to ${newName}`);
  }

  // ===== PLAY PLACEHOLDER =====
  if (command === 'play') {
    return message.reply('🎵 Music bot still fixing...');
  }
});

// ===== READY =====
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ===== SEND RULES EMBED =====
  const rulesChannel = client.channels.cache.get(RULES_CHANNEL_ID);
  if (rulesChannel) {
    const rulesEmbed = new EmbedBuilder()
      .setColor('#FFA500') // Orange color for rules
      .setTitle('📜 Server Rules')
      .setDescription(`
1️⃣ Be respectful to everyone  
2️⃣ No spamming or self-promotion  
3️⃣ Keep channels in their proper topics  
4️⃣ No NSFW content  
5️⃣ Follow Discord TOS
      `)
      .setFooter({ text: 'Please read and follow the rules!' })
      .setTimestamp();

    rulesChannel.send({ embeds: [rulesEmbed] }).catch(() => {});
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
