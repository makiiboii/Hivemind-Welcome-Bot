const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rules',
  async execute(message) {
    try {
      // Embed 1: Introduction & Safe Space Policy
      const rulesEmbed1 = new EmbedBuilder()
        .setColor('#ecd346')
        .setTitle('📜 Server Rules')
        .setDescription('Follow these rules to keep the server safe and fun for everyone!')
        .addFields(
          { 
            name: '🛡️ SAFE SPACE & PAST CONDUCT POLICY', 
            value: 'We prioritize the safety of our members. If it is discovered that a member has a history of misogyny, harassment, or predatory behavior (inside or outside this server), they will be kicked or banned immediately.', 
            inline: false 
          }
        )
        .setFooter({ text: 'Please read all sections carefully! ⚡' })
        .setTimestamp();

      // Embed 2: Be Kind Policy
      const rulesEmbed2 = new EmbedBuilder()
        .setColor('#ecd346')
        .setTitle('💚 BE KIND POLICY')
        .addFields(
          { 
            name: '🤝 RESPECT BOUNDARIES AND ASK FOR CONSENT', 
            value: 'If someone asks you to stop, stop. Keep interactions appropriate. No pressuring others.', 
            inline: false 
          },
          { 
            name: '👥 NO GENDER OR IDENTITY HARASSMENT', 
            value: 'Sexist remarks, degrading comments, homophobia, transphobia, or any discrimination based on sexual orientation or gender identity are strictly prohibited.', 
            inline: false 
          },
          { 
            name: '💘 NO BODY SHAMING', 
            value: 'Inappropriate appearance-based comments are not tolerated. Do not comment on a member\'s looks, body type, or personal physical traits.', 
            inline: false 
          },
          { 
            name: '🚫 NO HATE SPEECH', 
            value: 'Avoid hateful or insulting language. Only mention or comment on others when it is directly relevant to a specific, constructive discussion.', 
            inline: false 
          },
          { 
            name: '💬 NO HARASSMENT AND BULLYING', 
            value: 'Intimidating, or intentionally making someone uncomfortable is forbidden. Teasing is only permissible between close friends with clear, mutual consent.', 
            inline: false 
          }
        )
        .setColor('#ecd346');

      // Embed 3: More Be Kind Policy & Doxxing
      const rulesEmbed3 = new EmbedBuilder()
        .setColor('#ecd346')
        .setTitle('💚 BE KIND POLICY (Continued)')
        .addFields(
          { 
            name: '🧠 SENSITIVE TOPICS', 
            value: 'Be mindful of others\' experiences. Avoid sharing triggering, graphic, or overly explicit content.', 
            inline: false 
          },
          { 
            name: '🌐 KEEP IT CIVIL', 
            value: 'Disagreements are a natural part of any community, but disrespect is not. Address the argument, not the person.', 
            inline: false 
          },
          { 
            name: '🔎 NO DOXXING', 
            value: 'Doxxing is strictly forbidden. Leaking pictures, real names, addresses, or any personal information without explicit consent will result in punishment.', 
            inline: false 
          },
          { 
            name: '📩 RESPECT MODERATION', 
            value: 'Administrators work to keep the community safe. Publicly arguing about moderation decisions is prohibited; please use the ticket system for appeals.', 
            inline: false 
          },
          { 
            name: '🚩 REPORTING CONCERNS', 
            value: 'If you witness a violation, file a ticket. Reports are handled exclusively by directors and are treated with total confidentiality.', 
            inline: false 
          }
        )
        .setColor('#ecd346');

      // Embed 4: VC Etiquette
      const rulesEmbed4 = new EmbedBuilder()
        .setColor('#ecd346')
        .setTitle('🎙️ VOICE CHANNEL (VC) ETIQUETTE')
        .addFields(
          { 
            name: '🧨 NO VC TROLLING', 
            value: 'Strictly no ear-rape, loud noises, and screamers.', 
            inline: false 
          },
          { 
            name: '💌 RESPECT THE VC MEMBERS', 
            value: 'Avoid intentionally talking over others or using soundboards excessively to drown out conversation.', 
            inline: false 
          },
          { 
            name: '🔴 RECORDING CONSENT', 
            value: 'Do not record or share VC content without the explicit consent of everyone present in the channel.', 
            inline: false 
          }
        )
        .setColor('#ecd346');

      // Embed 5: Chat Etiquette
      const rulesEmbed5 = new EmbedBuilder()
        .setColor('#ecd346')
        .setTitle('💬 CHAT ETIQUETTE & TEXT CONDUCT')
        .addFields(
          { 
            name: '🚫 NO SPAMMING', 
            value: 'Avoid flooding the chat with excessive messages, emojis, or large blocks of text. This includes "wall of text" posting or repetitive @mentions.', 
            inline: false 
          },
          { 
            name: '⚠️ SPOILERS', 
            value: 'Use spoiler tags (||text||) for movies, games, or books that others may not have finished yet.', 
            inline: false 
          },
          { 
            name: '🧵 THREAD USAGE', 
            value: 'Use the "Reply" or "Thread" features for specific side-discussions to keep the main chat from becoming cluttered.', 
            inline: false 
          },
          { 
            name: '📢 NO ADVERTISING', 
            value: 'Advertisements of other servers are not allowed without explicit consent of the server directors.', 
            inline: false 
          }
        )
        .setColor('#ecd346')
        .setFooter({ text: 'Thank you for keeping our community safe and welcoming! 🤗' })
        .setTimestamp();

      // Send all embeds
      await message.reply({ embeds: [rulesEmbed1], allowedMentions: { repliedUser: false } });
      await message.channel.send({ embeds: [rulesEmbed2] });
      await message.channel.send({ embeds: [rulesEmbed3] });
      await message.channel.send({ embeds: [rulesEmbed4] });
      await message.channel.send({ embeds: [rulesEmbed5] });

    } catch (error) {
      console.error('Rules command error:', error);
      message.reply('❌ Error displaying rules.').catch(() => {});
    }
  }
};
