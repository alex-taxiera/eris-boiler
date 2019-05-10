const { Command } = require('../../lib')

module.exports = new Command({
  name: 'help',
  description: 'Displays this message, duh!',
  run: async function (context) {
    const {
      params,
      bot
    } = context
    if (params[0]) {
      const command = bot.findCommand(params[0])

      if (!command) {
        return `${params[0]} is not a command or alias!`
      }
      return {
        dm: true,
        content: '```' + command.info + '```'
      }
    }

    let commands = []
    let longName = 0
    for (let [ key, val ] of bot.commands) {
      for (const middleware of val.middleware) {
        if (!middleware.run(context)) {
          continue
        }
      }
      const length = val.name.length + val.aliases.join('/').length
      if (longName < length + 3) {
        longName = length + 3
      }
      commands.push({ name: key, desc: val.description, aliases: val.aliases })
    }

    let content = 'Available commands:```'
    for (let i = 0; i < commands.length; i++) {
      const val = commands[i]
      if (val.aliases.length > 0) {
        val.name += '/' + val.aliases.join('/')
      }
      val.name += ':' + ' '.repeat(longName - val.name.length)
      content += `\n${val.name}${val.desc}`
    }
    content += '\n```\nTo get more information try: `help command`'
    return {
      dm: true,
      content
    }
  }
})
