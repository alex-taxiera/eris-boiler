const { Event } = require('../classes')

module.exports = new Event({
  name: 'error',
  run: (bot, error) => bot.logger.error(error)
})
