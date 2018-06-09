const Command = require('../classes/Command.js')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'disable',
    description: 'disable a guild-wide option',
    options: {
      parameters: ['toggleName'],
      permission: 'VIP'
    },
    run: async ({ msg, params, bot }) => {
      const toggles = await bot.dbm.getToggles(msg.channel.guild.id)
      if (toggles[params[0]] === undefined) return 'Specify toggle to disable!'
      if (!toggles[params[0]]) return `${params[0]} is already disabled!`
      toggles[params[0]] = false
      bot.dbm.updateToggles(msg.channel.guild.id, toggles)
      return `${params[0]} disabled!`
    }
  }
)
