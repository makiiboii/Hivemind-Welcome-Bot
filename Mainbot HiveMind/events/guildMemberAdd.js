const { EmbedBuilder } = require('discord.js');
const { WELCOME_CHANNEL_ID } = require('../config/config');

module.exports = (member) => {
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
};
