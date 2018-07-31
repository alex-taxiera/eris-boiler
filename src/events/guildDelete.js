const Event = require('../classes/Event.js')

module.exports = new Event({
  name: 'guildDelete',
  run: (bot, guild) => {
    bot.logger.warn(`left ${guild.name} guild`)
    bot.dbm.removeClient(guild.id)
  }
})
