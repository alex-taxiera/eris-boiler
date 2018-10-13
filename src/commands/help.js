const { Command } = require('../lib')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'help',
    description: 'Displays this message, duh!',
    run: async function ({ msg, params, bot }) {
      if (params[0]) {
        const command = bot.commands.get(params[0]) || bot.commands.get(bot.aliases.get(params[0]))
        if (!command) return `${params[0]} is not a command or alias!`
        return sendHelp(msg, command.info)
      }

      const permLevel = await bot.permissionLevel(msg.member)
      let commands = []
      let longName = 0
      for (let [key, val] of bot.commands) {
        if (bot.permissions.get(val.permission).level > permLevel) continue
        const length = val.name.length + val.aliases.join('/').length
        if (longName < length + 3) longName = length + 3
        commands.push({ name: key, desc: val.description, aliases: val.aliases })
      }

      let content = 'Available commands:```'
      for (let i = 0; i < commands.length; i++) {
        const val = commands[i]
        if (val.aliases.length > 0) val.name += '/' + val.aliases.join('/')
        val.name += ':' + ' '.repeat(longName - val.name.length)
        content += `\n${val.name}${val.desc}`
      }
      content += '\n```\nTo get more information try: `help command`'
      return sendHelp(msg, content)
    }
  }
)

async function sendHelp (msg, content) {
  return msg.author.getDMChannel()
    .then((dm) => dm.createMessage(content))
    .then((success) => 'DM sent.')
    .catch((e) => content)
}
