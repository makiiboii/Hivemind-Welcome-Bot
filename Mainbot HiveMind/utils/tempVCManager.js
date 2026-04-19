// Temp VC Manager - Handles temporary voice channel creation and management

const tempVCs = new Map(); // channelId -> ownerId
const sentHelp = new Set(); // Track help messages sent

module.exports = {
  tempVCs,
  sentHelp,
};
