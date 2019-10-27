const { Command } = require('eris-boiler')

module.exports = new Command({
  name: 'ping',
  description: 'Pings the bot',
  async run ({ msg }) {
    const ping = await msg.channel.createMessage('Pinging...')

    const pong = ping.edit(`:ping_pong: Pong!`)

    return `Responded in ${pong.createdAt - ping.createdAt}ms`
  }
})
