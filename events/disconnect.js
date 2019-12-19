const { DiscordEvent, Utils } = require('../lib')

module.exports = new DiscordEvent({
  name: 'disconnect',
  run: (bot) => Utils.logger.error('disconnected')
})
