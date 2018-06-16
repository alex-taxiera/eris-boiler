const Command = require('../classes/Command.js')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'help',
    description: 'Displays this message, duh!',
    run: async function ({ msg, params, bot }) {
      let content
      let command
      if (params[0]) {
        command = bot.commands.get(params[0]) || bot.commands.get(bot.aliases.get(params[0]))
        if (!command) return `${params[0]} is not a command or alias!`
        content = command.info
      } else {
        content = 'Available commands:```'
        let commands = []
        for (let [key, val] of bot.commands) {
          if (!await bot.permissions.get(val.permission).check(msg.member, bot)) continue
          commands.push({ name: key, desc: val.description, aliases: val.aliases })
        }
        const longName =
          Math.max(...commands.map((val) => val.name.length + val.aliases.join('/').length)) +
          3
        commands = commands.map((val) => {
          if (val.aliases.length > 0) val.name += '/' + val.aliases.join('/')
          val.name += ':' + ' '.repeat(longName - val.name.length)
          return val
        })
        for (let i = 0; i < commands.length; i++) {
          const val = commands[i]
          content += `\n${val.name}${val.desc}`
        }
        content += '\n```\nTo get more information try: `help command`'
      }

      try {
        const dm = await msg.author.getDMChannel()
        await dm.createMessage(content)
        return 'DM sent.'
      } catch (e) {
        return content
      }
    }
  }
)
