module.exports = async (bot, commandName) => {
  let command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName))
  if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`

  delete require.cache[require.resolve(`../commands/${command.name}.js`)]
}
