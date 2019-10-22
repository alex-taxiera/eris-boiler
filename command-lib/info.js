const { Command } = require('../lib')

module.exports = new Command({
  name: 'info',
  description: 'Displays bot info.',
  options: {
    deleteResponseDelay: 30000
  },
  run: async ({ bot }) => {
    const owner = bot.users.get(bot.ownerID)
    const ownerName = owner.username + '#' + owner.discriminator
    const guilds = bot.guilds.size
    const inline = true
    const embed = {
      description: ':heartbeat: **Info**',
      thumbnail: { url: bot.user.avatarURL },
      timestamp: require('dateformat')(Date.now(), 'isoDateTime'),
      color: 0x3498db,
      fields: [
        { name: 'Owner', value: ownerName, inline },
        { name: 'Guilds Served', value: guilds, inline },
        { name: 'Built With', value: '[eris-boiler](https://github.com/alex-taxiera/eris-boiler)\n[eris](https://github.com/abalabahaha/eris)', inline }
      ],
      footer: {
        icon_url: bot.user.avatarURL,
        text: 'eris-boiler'
      }
    }
    return { embed }
  }
})
