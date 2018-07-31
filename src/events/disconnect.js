const Event = require('../classes/Event.js')

module.exports = new Event({
  name: 'disconnect',
  run: (bot) => bot.logger.error('disconnected')
})
