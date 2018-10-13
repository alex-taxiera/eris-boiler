const { Event } = require('../lib')

module.exports = new Event({
  name: 'messageCreate',
  run: async (bot, msg) => bot.ora.processMessage(bot, msg)
})
