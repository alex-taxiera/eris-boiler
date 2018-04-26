module.exports = (bot, commandFile) => {
  if (!commandFile.endsWith('.js')) return
  try {
    const command = require(`../commands/${commandFile}`)
    bot.commands.set(command.name, command)
    for (let i = 0; i < command.aliases.length; i++) {
      bot.aliases.set(command.aliases[i], command.name)
    }
    bot.logger.success(`Loaded ${bot.commands.get(command.name).name} Command`)
  } catch (e) {
    bot.logger.error(`Unable to load command ${commandFile}: ${e}`)
  }
}
