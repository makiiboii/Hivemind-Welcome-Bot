client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // =========================
  // 🔥 KICK COMMAND (NO VC NEEDED)
  // =========================
  if (command === 'kick') {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Mention a user to kick.");

    if (!member.kickable) return message.reply("❌ I cannot kick this user.");

    try {
      await member.kick();
      return message.channel.send(`✅ ${member.user.tag} has been kicked.`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to kick user.");
    }
  }

  // =========================
  // 🔥 BAN COMMAND (NO VC NEEDED)
  // =========================
  if (command === 'ban') {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Mention a user to ban.");

    if (!member.bannable) return message.reply("❌ I cannot ban this user.");

    try {
      await member.ban({ reason: "No reason provided" });
      return message.channel.send(`🚫 ${member.user.tag} has been banned.`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to ban user.");
    }
  }

  // =========================
  // 🎧 YOUR ORIGINAL VC SYSTEM (UNCHANGED)
  // =========================

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
