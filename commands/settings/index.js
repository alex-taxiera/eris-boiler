const { GuildCommand } = require('../../lib')
const { vip: permission } = require('../../permissions')

const prefix = require('./prefix')
const vip = require('./vip')

module.exports = new GuildCommand({
  name: 'settings',
  description: 'Change some settings for your server :)',
  options: {
    permission,
    subCommands: [
      prefix,
      vip
    ]
  },
  run: async (bot, context) => ({
    embed: {
      description: ':gear: [**Settings**](https://github.com/alex-taxiera/eris-boiler)',
      thumbnail: { url: bot.user.avatarURL },
      timestamp: require('dateformat')(Date.now(), 'isoDateTime'),
      color: 0x3498db,
      footer: {
        icon_url: bot.user.avatarURL,
        text: 'eris-boiler'
      },
      fields: this.subCommands.map((sub) => ({
        name: sub.displayName,
        value: sub.getValue(bot, context),
        inline: true
      }))
    }
  })
})
