const { Command } = require('../classes')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'preferences',
    description: 'Display guild-wide options',
    options: {
      aliases: ['prefs', 'settings'],
      permission: 'VIP',
      deleteResponseDelay: 15000
    },
    run: async function ({ msg, bot }) {
      // TODO get all settings and toggles and generate embed based on that
      const inline = true
      const guild = msg.channel.guild
      const { vip, prefix } = await bot.dbm.getSettings(guild.id)

      const vipRole = bot.guilds.get(guild.id).roles.get(vip)
      const embed = {
        description: ':heartbeat: [**Preferences**](https://github.com/alex-taxiera/eris-boiler)',
        thumbnail: { url: bot.user.avatarURL },
        timestamp: require('dateformat')(Date.now(), 'isoDateTime'),
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
      return { embed }
    }
  }
)
