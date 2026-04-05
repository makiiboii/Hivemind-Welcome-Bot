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

  // ===== MULTI-KICK =====
  if (command === 'kick') {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    const members = message.mentions.members;
    if (!members.size) return message.reply("❌ Mention at least one user to kick.");

    const kicked = [];
    const failed = [];

    for (const [id, member] of members) {
      if (!member.kickable) {
        failed.push(member.user.tag);
        continue;
      }
      try {
        await member.kick();
        kicked.push(member.user.tag);
      } catch {
        failed.push(member.user.tag);
      }
    }

    let reply = '';
    if (kicked.length) reply += `✅ Kicked: ${kicked.join(', ')}\n`;
    if (failed.length) reply += `❌ Failed: ${failed.join(', ')}`;
    return message.channel.send(reply);
  }

  // ===== MULTI-BAN =====
  if (command === 'ban') {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    const members = message.mentions.members;
    if (!members.size) return message.reply("❌ Mention at least one user to ban.");

    const banned = [];
    const failed = [];

    for (const [id, member] of members) {
      if (!member.bannable) {
        failed.push(member.user.tag);
        continue;
      }
      try {
        await member.ban({ reason: 'Banned via bot command' });
        banned.push(member.user.tag);
      } catch {
        failed.push(member.user.tag);
      }
    }

    let reply = '';
    if (banned.length) reply += `✅ Banned: ${banned.join(', ')}\n`;
    if (failed.length) reply += `❌ Failed: ${failed.join(', ')}`;
    return message.channel.send(reply);
  }

});
