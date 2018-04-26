const Command = require('../classes/Command.js')

module.exports = new Command({
  name: 'enable',
  description: 'enable a global setting',
  parameters: ['toggleName'],
  permission: 'Admin',
  run: async ({ params, bot }) => {
    const toggle = bot.toggles.get(params[0])
    if (!toggle) return 'Specify option to enable'
    return toggle.enable(bot)
  }
})
