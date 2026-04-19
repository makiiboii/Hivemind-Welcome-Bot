const { PREFIX } = require('../config/config');
const kickCommand = require('../commands/kick');
const banCommand = require('../commands/ban');
const rulesCommand = require('../commands/rules');
const vcCommands = require('../commands/vc');

module.exports = async (message) => {
  if (!message.guild || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    // Kick command
    if (command === 'kick') {
      return await kickCommand.execute(message, args);
    }

    // Ban command
    if (command === 'ban') {
      return await banCommand.execute(message, args);
    }

     // Rules command
    if (command === 'rules') {
      return await rulesCommand.execute(message);
    }

    // VC commands (limit, lock, unlock, name, play)
    if (['limit', 'lock', 'unlock', 'name', 'play'].includes(command)) {
      return await vcCommands.execute(message, args, command);
    }

  } catch (error) {
    console.error('Command error:', error);
    message.reply('❌ An error occurred while running this command.').catch(() => {});
  }
};
