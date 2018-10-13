const { Event } = require('../lib')

module.exports = new Event({
  name: 'disconnect',
  run: (bot) => bot.logger.error('disconnected')
})
