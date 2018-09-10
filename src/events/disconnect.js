const { Event } = require('../classes')

module.exports = new Event({
  name: 'disconnect',
  run: (bot) => bot.logger.error('disconnected')
})
