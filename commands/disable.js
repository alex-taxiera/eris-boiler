const Command = require('../classes/Command.js')

module.exports = new Command({
  name: 'disable',
  description: 'disable a guild-wide option',
  parameters: ['toggleName'],
  permission: 'Admin',
  run: async ({ msg, params, bot }) => {
    const id = msg.channel.guild.id

    switch (params[0]) {
      default:
        // follow same organization as set.js, calling toggle.disable
        return 'Specify option to disable!'
    }
  }
})
