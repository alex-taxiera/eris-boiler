const Event = require('../classes/Event.js')

module.exports = new Event({
  name: 'error',
  run: (bot, error) => bot.logger.error(error)
})
