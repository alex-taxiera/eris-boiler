module.exports = (bot, guild) => {
  bot.logger.warn(`left ${guild.name} guild`)
  bot.dbm.removeClient(guild.id)
}
