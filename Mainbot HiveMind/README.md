# Mainbot HiveMind - Organized Structure

Your Discord bot is now organized into separate modules for better maintainability and clarity!

## 📁 Project Structure

```
Mainbot HiveMind/
├── index.js                 # Main entry point - minimal, clean
├── package.json             # Dependencies
├── config/
│   └── config.js           # All configuration constants (IDs, PREFIX)
├── events/
│   ├── voiceStateUpdate.js # Temp VC creation & management
│   ├── guildMemberAdd.js   # Welcome messages for new members
│   ├── clientReady.js      # Bot startup - posts rules
│   └── messageCreate.js    # Command handler & routing
├── commands/
│   ├── kick.js             # Kick command
│   ├── ban.js              # Ban command
│   └── vc.js               # VC commands (limit, lock, unlock, name, play)
└── utils/
    └── tempVCManager.js    # Temp VC data management
```

## 🎯 What Changed?

### Before ❌
- Everything was in one massive `index.js` file
- Hard to find and modify specific features
- Mixed concerns (config, events, commands all together)

### After ✅
- **Modular structure** - Each feature in its own file
- **Easy to maintain** - Find what you need quickly
- **Scalable** - Easy to add new commands or events

## 📝 How It Works

### Config (`config/config.js`)
Centralized storage for all your Discord IDs and settings. Update these once and they're used everywhere.

### Events (`events/`)
Each Discord event gets its own file:
- `voiceStateUpdate.js` - Handles temp VC creation
- `guildMemberAdd.js` - Welcomes new members  
- `clientReady.js` - Posts server rules on startup
- `messageCreate.js` - Routes all commands

### Commands (`commands/`)
Each command is independent:
- `kick.js` - Kick users (requires permission)
- `ban.js` - Ban users (requires permission)
- `vc.js` - Voice channel controls (only for VC owner)

### Utils (`utils/`)
Shared utilities:
- `tempVCManager.js` - Manages temporary VC data

## 🚀 Running Your Bot

Nothing changed! Just run:
```bash
npm start
```

## ➕ Adding New Commands

Want to add a new command? It's easy now!

1. Create `commands/mycommand.js`:
```javascript
module.exports = {
  name: 'mycommand',
  async execute(message, args) {
    message.reply('Hi from my command!');
  }
};
```

2. Add it to `events/messageCreate.js` in the command handler

That's it! 🎉

## 🔧 Customizing

- **Change bot prefix?** → Update `config/config.js`
- **Change Discord IDs?** → Update `config/config.js`
- **Modify VC features?** → Edit `events/voiceStateUpdate.js` and `commands/vc.js`
- **Change welcome message?** → Edit `events/guildMemberAdd.js`
- **Change server rules?** → Edit `events/clientReady.js`
