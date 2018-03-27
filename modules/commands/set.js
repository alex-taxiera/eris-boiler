const database = require('../database.js')
const Command = require('./Command.js')

module.exports = new Command({
  name: 'set',
  description: 'Set a guild-wide option',
  parameters: ['"vip|prefix"', 'value to set to'],
  permission: 'VIP',
  run: async ({ msg, params }) => {
    const id = msg.channel.guild.id

    let option = params.splice(0, 1)[0]
    let fullParam = params.join(' ')

    switch (option) {
      case 'vip':
        const { vip } = await database.getClient(id)
        let role = msg.channel.guild.roles.find((r) => r.name === fullParam)
        if (!role) return `Could not find role "${fullParam}"`
        if (role.id === vip) return 'VIP is already set to that role!'
        database.updateClient(id, { vip: role.id })
        return 'VIP set!'
      case 'prefix':
        const { prefix } = await database.getClient(id)
        if (fullParam === prefix) return `Prefix is already set to "${prefix}"`
        database.updateClient(id, { prefix: fullParam })
        return 'Prefix set!'
      default:
        return 'Specify option to set with first param!'
    }
  }
})
