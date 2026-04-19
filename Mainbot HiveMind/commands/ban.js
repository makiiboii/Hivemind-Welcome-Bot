const { PermissionsBitField } = require('discord.js');
const { RULES_CHANNEL_ID } = require('../config/config');

module.exports = {
  name: 'ban',
  async execute(message, args) {
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
};
