const { DiscordEvent } = require('../lib')
const { logger } = require('../util')

module.exports = new DiscordEvent({
  name: 'error',
  run: (bot, error) => logger.error(error)
})
