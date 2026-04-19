const { PermissionsBitField } = require('discord.js');
const { RULES_CHANNEL_ID } = require('../config/config');

module.exports = {
  name: 'kick',
  async execute(message, args) {
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

    await message.delete().catch(() => {});

    const rulesChannel = message.guild.channels.cache.get(RULES_CHANNEL_ID);
    return message.channel.send({
      content: `✅ Kicked: ${kicked.join(', ')}\nPlease read the rules: ${rulesChannel ? rulesChannel.toString() : ''}`
    });
  }
};
