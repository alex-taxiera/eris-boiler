const Command = require('../classes/Command.js')

module.exports = new Command({
  name: 'default',
  description: 'Set default options',
  parameters: ['"prefix"|"status"', 'value to make default'],
  permission: 'Admin',
  run: async ({ params, bot }) => {
    const setting = bot.settings.get(params.splice(0, 1)[0])
    if (!setting) return 'Specify option to set'
    return setting.setValue(params.join(' '), bot)
  }
})
