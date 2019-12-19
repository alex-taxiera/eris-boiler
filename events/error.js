const { DiscordEvent, Utils } = require('../lib')

module.exports = new DiscordEvent({
  name: 'error',
  run: (bot, error) => Utils.logger.error(error)
})
