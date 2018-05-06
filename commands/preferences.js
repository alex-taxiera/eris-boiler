const Command = require('../classes/Command.js')

module.exports = new Command({
  name: 'preferences',
  aliases: ['prefs', 'settings'],
  description: 'Display guild-wide options',
  permission: 'VIP',
  run: async function ({ msg, bot }) {
    const inline = true
    const id = msg.channel.guild.id
    const { vip, prefix } = await bot.dbm.getClient(id)
    let role = bot.guilds.get(id).roles.get(vip)
    role = role ? role.name : 'None'

    const embed = {
      description: ':heartbeat: [**Preferences**](https://github.com/alex-taxiera/eris-boiler)',
      thumbnail: { url: bot.user.avatarURL },
      timestamp: require('moment'),
      color: 0x3498db,
      footer: {
        icon_url: bot.user.avatarURL,
        text: 'eris-boiler'
      },
      fields: [
        { name: 'Prefix', value: prefix, inline },
        { name: 'VIP Role', value: role, inline }
      ]
    }
    return { embed, delay: 15000 }
  }
})
