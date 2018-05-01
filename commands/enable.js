const Command = require('../classes/Command.js')

module.exports = new Command({
  name: 'enable',
  description: 'enable a guild-wide option',
  parameters: ['toggleName'],
  permission: 'Admin',
  run: async ({ msg, params, bot }) => {
    const id = msg.channel.guild.id

    switch (params[0]) {
      default:
        // follow same organization as set.js, calling toggle.enable
        return 'Specify option to disable!'
    }
  }
})
