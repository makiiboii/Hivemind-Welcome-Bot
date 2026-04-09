// index.js

const { Client, GatewayIntentBits, ChannelType, EmbedBuilder, PermissionsBitField } = require('discord.js');

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

// ===== VOICE STATE UPDATE =====
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    if (newState.channelId === CREATE_CHANNEL_ID) {
      const tempChannel = await newState.guild.channels.create({
        name: `${newState.member.user.username}'s VC`,
        type: ChannelType.GuildVoice,
        parent: CATEGORY_ID,
        userLimit: 0
      });

      tempVCs.set(tempChannel.id, newState.member.id);
      await newState.setChannel(tempChannel);

      const welcomeEmbed = new EmbedBuilder()
        .setColor('#ecd346')
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

    if (oldState.channelId && tempVCs.has(oldState.channelId)) {
      const channel = oldState.guild.channels.cache.get(oldState.channelId);
      if (channel && channel.members.size === 0) {
        await channel.delete().catch(() => {});
        tempVCs.delete(oldState.channelId);
      }
    }

    if (!oldState.channel && newState.channel) {
      const vc = newState.channel;
      if (tempVCs.has(vc.id)) {
        const key = `${newState.member.id}-${vc.id}`;
        if (sentHelp.has(key)) return;

        sentHelp.add(key);

        const helpEmbed = new EmbedBuilder()
          .setColor('#ecd346')
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
    .setColor('#ecd346')
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

  // ===== KICK =====
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply('❌ You do not have permission to kick');

    if (!args.length) return message.reply('❌ Mention users or provide IDs to kick');

    const kicked = [];
    for (const userIdOrMention of args) {
      const id = userIdOrMention.replace(/\D/g, '');
      const member = message.guild.members.cache.get(id) || await message.guild.members.fetch(id).catch(() => null);
      if (member && member.kickable) {
        await member.kick().catch(() => null);
        kicked.push(member.user.tag);
      }
    }

    if (!kicked.length) return message.reply('❌ No one could be kicked');

    // Delete your command message
    await message.delete().catch(() => {});

    // Send reminder in the same channel
    const rulesChannel = message.guild.channels.cache.get(RULES_CHANNEL_ID);
    return message.channel.send({
      content: `✅ Kicked: ${kicked.join(', ')}\nPlease read the rules: ${rulesChannel ? rulesChannel.toString() : ''}`
    });
  }

  // ===== BAN =====
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply('❌ You do not have permission to ban');

    if (!args.length) return message.reply('❌ Mention users or provide IDs to ban');

    const banned = [];
    for (const userIdOrMention of args) {
      const id = userIdOrMention.replace(/\D/g, '');
      const member = message.guild.members.cache.get(id) || await message.guild.members.fetch(id).catch(() => null);
      if (member && member.bannable) {
        await member.ban().catch(() => null);
        banned.push(member.user.tag);
      }
    }

    if (!banned.length) return message.reply('❌ No one could be banned');

    await message.delete().catch(() => {});

    const rulesChannel = message.guild.channels.cache.get(RULES_CHANNEL_ID);
    return message.channel.send({
      content: `✅ Banned: ${banned.join(', ')}\nPlease read the rules: ${rulesChannel ? rulesChannel.toString() : ''}`
    });
  }

  // ===== TEMP VC COMMANDS =====
  const vc = message.member.voice.channel;
  if (!vc || !tempVCs.has(vc.id)) return;
  if (tempVCs.get(vc.id) !== message.member.id) return;

  if (command === 'limit') {
    const limit = parseInt(args[0]);
    if (isNaN(limit) || limit < 0 || limit > 99) return;
    await vc.setUserLimit(limit);
    return message.reply(`✅ Limit set to ${limit}`);
  }

  if (command === 'lock') {
    await vc.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: false });
    return message.reply('🔒 VC locked');
  }

  if (command === 'unlock') {
    await vc.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: true });
    return message.reply('🔓 VC unlocked');
  }

  if (command === 'name') {
    const newName = args.join(' ');
    if (!newName) return;
    await vc.setName(newName);
    return message.reply(`✅ Renamed to ${newName}`);
  }

  if (command === 'play') {
    return message.reply('🎵 Music bot still fixing...');
  }
});

// ===== CLIENT READY =====
client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

 // ===== SEND WEBSITE LINK (MODERN) =====
const webChannel = client.channels.cache.get("1490732045083607040");
if (webChannel) {
  const webEmbed = new EmbedBuilder()
    .setColor('#ecd346') // Discord blurple 🔥
    .setAuthor({ name: '🌐 Hivemind Network', iconURL: client.user.displayAvatarURL() })
    .setTitle('🚀 Official Website')
    .setDescription(`
> ✨ Welcome to **Hivemind Web**

🔗 **Visit here:**
https://hivemind-web-pi.vercel.app/

💡 Stay updated, explore features, and connect with the community!
    `)
    .addFields(
      { name: '📌 What’s inside?', value: '• Community Updates\n• Server Info\n• Future Features', inline: true },
      { name: '⚡ Status', value: '🟢 Online & Active', inline: true }
    )
    .setThumbnail(client.user.displayAvatarURL())
    .setImage('https://i.imgur.com/AfFp7pu.png') // optional banner (you can change/remove)
    .setFooter({ text: 'Hivemind • Stay Connected', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();

  webChannel.send({ embeds: [webEmbed] }).catch(console.error);
}

  // ===== MODERN RULES EMBED =====
  const rulesChannel = client.channels.cache.get(RULES_CHANNEL_ID);
  if (rulesChannel) {
    const rulesEmbed = new EmbedBuilder()
      .setColor('#ecd346')
      .setTitle('📜 Server Rules')
      .setDescription('Follow these rules to keep the server safe and fun for everyone!')
      .addFields(
        { name: '📝 Nicknames', value: '➭ Nicknames should be minor-friendly.', inline: false },
        { name: '💬 Channels', value: '➭ Keep the talk to appropriate channels. Strictly no VC trolling.', inline: false },
        { name: '🚫 Doxxing', value: '➭ DOXXING IS STRICTLY FORBIDDEN. Leaking pictures or personal info without consent will be punished.', inline: false },
        { name: '❌ Offensive Language', value: '➭ Don’t use racial, gender, or homophobic slurs. Respect boundaries.', inline: false },
        { name: '🙅 Harassment', value: '➭ No harassment, trolling, baiting, reaction spam, bullying, or inappropriate DMs.', inline: false },
        { name: '📢 Advertising', value: '➭ No posting advertisements without admin approval.', inline: false },
        { name: '🌐 Promotion', value: '➭ No promotion of other servers.', inline: false },
        { name: '🔞 NSFW Content', value: '➭ No inappropriate/NSFW media including profile images.', inline: false },
        { name: '🤝 Respect', value: '➭ Treat others with respect. Be kind and considerate.', inline: false },
        { name: '⚠️ Penalties', value: '1️⃣ 1st offense: Warning\n2️⃣ 2nd offense: 1 month timeout\n3️⃣ 3rd offense: Ban', inline: false }
      )
      .setFooter({ text: 'Please read carefully! ⚡' })
      .setTimestamp();

    rulesChannel.send({ embeds: [rulesEmbed] }).catch(() => {});
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
