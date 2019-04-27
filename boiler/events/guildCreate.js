const { Event, Utils } = require('../../lib')

module.exports = new Event({
  name: 'guildCreate',
  run: (bot, guild) => {
    Utils.logger.success(`joined ${guild.name} guild`)
    bot.dbm.addClient(guild.id, bot.defaultSettings.prefix)
  }
})
