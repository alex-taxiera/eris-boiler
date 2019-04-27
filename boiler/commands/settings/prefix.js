const { Command } = require('../../lib')

module.exports = new Command({
  name: 'prefix',
  description: 'set prefix for server',
  options: {
    parameters: ['desired prefix']
  },
  run: async ({ bot, msg, params }) => {
    const fullParam = params.join(' ')
    if (!fullParam) {
      return 'Please provide a prefix!'
    }

    const dbGuild = await bot.dbm.query('guild').get(msg.channel.guild.id)
    if (fullParam === dbGuild.get('prefix')) {
      return `Prefix is already set to "${fullParam}"`
    }

    await dbGuild.save({ prefix: fullParam })
    return 'Prefix set!'
  }
})
