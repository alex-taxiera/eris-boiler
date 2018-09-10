const { Event } = require('../classes')

module.exports = new Event({
  name: 'messageCreate',
  run: async (bot, msg) => bot.ora.processMessage(bot, msg)
})
