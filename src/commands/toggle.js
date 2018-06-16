const Command = require('../classes/Command.js')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'toggle',
    description: 'toggle a global setting',
    options: {
      parameters: ['toggleName'],
      permission: 'Admin'
    },
    run: async ({ params, bot }) => {
      const toggle = bot.toggles.get(params[0])
      if (!toggle) return 'Specify option to toggle'
      if (!toggle.value) return toggle.enable(bot)
      return toggle.disable(bot)
    }
  }
)
