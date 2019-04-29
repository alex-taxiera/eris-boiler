const { Event, Utils } = require('../../lib')

module.exports = new Event({
  name: 'guildCreate',
  run: (bot, guild) => {
    Utils.logger.success(`joined ${guild.name} guild`)
    bot.dbm.newObject('guild').save({ id: guild.id })
  }
})
