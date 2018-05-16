const Command = require('../classes/Command.js')

module.exports = (bot) => {
  return new Command(
    bot,
    {
      name: 'set',
      description: 'Set a guild-wide option',
      options: {
        parameters: ['"vip"|"prefix"', 'value to set to'],
        permission: 'Guild Owner'
      },
      run: async ({ msg, params, bot }) => {
        const id = msg.channel.guild.id

        const option = params.splice(0, 1)[0]
        const fullParam = params.join(' ')

        switch (option) {
          case 'vip':
            const { vip } = await bot.dbm.getSettings(id)
            const role = msg.channel.guild.roles.find((r) => r.name === fullParam)
            if (!role) return `Could not find role "${fullParam}"`
            if (role.id === vip) return 'VIP is already set to that role!'
            bot.dbm.updateClient(id, { vip: role.id })
            return 'VIP set!'
          case 'prefix':
            const { prefix } = await bot.dbm.getSettings(id)
            if (fullParam === prefix) return `Prefix is already set to "${prefix}"`
            bot.dbm.updateClient(id, { prefix: fullParam })
            return 'Prefix set!'
          default:
            return 'Specify option to set with first param!'
        }
      }
    }
  )
}
