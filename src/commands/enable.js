const Command = require('../classes/Command.js')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'enable',
    description: 'enable a guild-wide option',
    options: {
      parameters: ['toggleName'],
      permission: 'VIP'
    },
    run: async ({ msg, params, bot }) => {
      const toggles = await bot.dbm.getToggles(msg.channel.guild.id)
      if (toggles[params[0]] === undefined) return 'Specify toggle to enable!'
      if (toggles[params[0]]) return `${params[0]} is already enabled!`
      toggles[params[0]] = true
      bot.dbm.updateToggles(msg.channel.guild.id, toggles)
      return `${params[0]} enabled!`
    }
  }
)
