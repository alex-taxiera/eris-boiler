const { Event, Utils } = require('../../lib')

module.exports = new Event({
  name: 'guildDelete',
  run: (bot, guild) => {
    Utils.logger.warn(`left ${guild.name} guild`)
    bot.dbm.removeClient(guild.id)
  }
})
