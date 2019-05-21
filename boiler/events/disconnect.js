const { Event, Utils } = require('../../lib')

module.exports = new Event({
  name: 'disconnect',
  run: (bot) => Utils.logger.error('disconnected')
})
