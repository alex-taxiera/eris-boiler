const { Command } = require('../lib')

module.exports = new Command({
  name: 'help',
  description: 'Displays this message, duh!',
  run: async (context) => {
    const {
      params,
      bot
    } = context

    if (params[0]) {
      return commandInfo(bot, params[0])
    }

    const { commands, longName } = filterCommands(bot.commands, context)

    let content = commands.reduce(
      (ax, { name, description, aliases }) => ax + `\n${name}` + (
        aliases.length > 0 ? '/' + aliases.join('/') : ''
      ) + ':' + ' '.repeat(longName - name.length) + description,
      'Available commands:```'
    ) + '\n```\nTo get more information try: `help command`'

    return {
      dm: true,
      content
    }
  }
})

function filterCommands (commands, context) {
  return commands.reduce(
    ({ commands, longName }, command) => {
      if (context.bot.ora.hasPermission({ ...context, command })) {
        const {
          name,
          aliases,
          description
        } = command

        longName = Math.max(
          name.length + aliases.join('/').length + 3, longName
        )
        commands.push({ name, description, aliases })
      }

      return { commands, longName }
    }, { commands: [], longName: 0 }
  )
}

function commandInfo (bot, cmd) {
  const command = bot.findCommand(cmd)

  if (!command) {
    return `${cmd} is not a command or alias!`
  }

  return {
    dm: true,
    content: '```' + command.info + '```'
  }
}
