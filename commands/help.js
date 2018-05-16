const Command = require('../classes/Command.js')

module.exports = (bot) => {
  return new Command(
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
          content = command.help()
        } else {
          content = 'Available commands:```'
          let commands = []
          for (let [key, val] of bot.commands) {
            if (!await bot.permissions.get(val.permission).check(msg.member, bot)) continue
            commands.push({ name: key + ':', desc: val.description })
          }
          const long = commands.sort((a, b) => (a - b) * -1)[0].name.length + 2
          commands = commands.map((val) => {
            let { name, desc } = val
            name += ' '.repeat(long - name.length)
            return { name, desc }
          })
          for (let i = 0; i < commands.length; i++) {
            const val = commands[i]
            content += `\n${val.name}${val.desc}`
          }
          content += '\n```\nTo get more information try: `help command`'
        }

        try {
          const dm = await msg.author.getDMChannel()
          dm.createMessage(content)
          return 'DM sent.'
        } catch (e) {
          return content
        }
      }
    }
  )
}
