module.exports = (bot, guild) => {
  bot.logger.success(`joined ${guild.name} guild`)
  bot.dbm.addClient(guild.id)
}
