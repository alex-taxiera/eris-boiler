const { Event, Utils } = require('../lib')

module.exports = new Event({
  name: 'error',
  run: (bot, error) => Utils.logger.error(error)
})
