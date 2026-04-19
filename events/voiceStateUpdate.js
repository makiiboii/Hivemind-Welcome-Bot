const { ChannelType, EmbedBuilder } = require('discord.js');
const { tempVCs, sentHelp } = require('../utils/tempVCManager');
const { CREATE_CHANNEL_ID, CATEGORY_ID } = require('../config/config');

module.exports = async (oldState, newState) => {
  try {
    // User joined the "Create VC" channel
    if (newState.channelId === CREATE_CHANNEL_ID) {
      const tempChannel = await newState.guild.channels.create({
        name: `${newState.member.user.username}'s VC`,
        type: ChannelType.GuildVoice,
        parent: CATEGORY_ID,
        userLimit: 0
      });

      tempVCs.set(tempChannel.id, newState.member.id);
      await newState.setChannel(tempChannel);

      // Send welcome embed
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

    // Delete VC if empty
    if (oldState.channelId && tempVCs.has(oldState.channelId)) {
      const channel = oldState.guild.channels.cache.get(oldState.channelId);
      if (channel && channel.members.size === 0) {
        await channel.delete().catch(() => {});
        tempVCs.delete(oldState.channelId);
      }
    }

    // Send help message to new VC joiners
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
};
