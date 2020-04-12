const { DiscordEvent } = require('../lib')
const { logger } = require('../util')

module.exports = new DiscordEvent({
  name: 'disconnect',
  run: (bot) => logger.error('disconnected')
})
