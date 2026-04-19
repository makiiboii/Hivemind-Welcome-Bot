const { tempVCs } = require('../utils/tempVCManager');

// VC Commands (limit, lock, unlock, name, play)
module.exports = {
  name: 'vc',
  async execute(message, args, command) {
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
  }
};
