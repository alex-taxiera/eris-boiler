const Command = require('../classes/Command.js')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'preferences',
    description: 'Display guild-wide options',
    options: {
      aliases: ['prefs', 'settings'],
      permission: 'VIP'
    },
    run: async function ({ msg, bot }) {
      const inline = true
      const guild = msg.channel.guild
      const { vip, prefix } = await bot.dbm.getSettings(guild.id)
      // const { game, watch, listen, stream } = await bot.dbm.getToggles(guild.id)

      const vipRole = bot.guilds.get(guild.id).roles.get(vip)
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
          { name: 'VIP Role', value: vip ? vipRole.name : 'None', inline }
        ]
      }
      return { embed, delay: 15000 }
    }
  }
)
