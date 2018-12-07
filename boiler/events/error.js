const { Event } = require('../../lib')

module.exports = new Event({
  name: 'error',
  run: (bot, error) => bot.logger.error(error)
})
