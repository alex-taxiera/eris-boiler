const Event = require('../classes/Event.js')

module.exports = new Event({
  name: 'messageCreate',
  run: async (bot, msg) => bot.ora.processMessage(bot, msg)
})
