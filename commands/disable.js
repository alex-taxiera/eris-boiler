const Command = require('../classes/Command.js')

module.exports = (bot) => {
  return new Command(
    bot,
    {
      name: 'disable',
      description: 'disable a guild-wide option',
      options: {
        parameters: ['toggleName'],
        permission: 'VIP'
      },
      run: async ({ msg, params, bot }) => {
        const id = msg.channel.guild.id

        switch (params[0]) {
          default:
            // follow same organization as set.js, calling toggle.disable
            return 'Specify option to disable!'
        }
      }
    }
  )
}
