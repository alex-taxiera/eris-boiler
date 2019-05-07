const { Command } = require('../../lib')
const subCommands = require('./settings/')

module.exports = new Command({
  name: 'settings',
  description: 'Change some settings for your server :)',
  options: {
    permission: 60,
    subCommands
  },
  run: async ({ bot, msg }) => {
    const inline = true
    const guild = msg.channel.guild
    const dbGuild = await bot.dbm.newQuery('guild').get(guild.id)
    const { vip, prefix } = dbGuild.toJSON()

    const vipRole = bot.guilds.get(guild.id).roles.get(vip)
    const embed = {
      description: ':gear: [**Settings**](https://github.com/alex-taxiera/eris-boiler)',
      thumbnail: { url: bot.user.avatarURL },
      timestamp: require('dateformat')(Date.now(), 'isoDateTime'),
      color: 0x3498db,
      footer: {
        icon_url: bot.user.avatarURL,
        text: 'eris-boiler'
      },
      fields: [
        { name: 'Prefix', value: prefix || bot.ora.defaultPrefix, inline },
        { name: 'VIP Role', value: vip ? vipRole.name : 'None', inline }
      ]
    }
    return { embed }
  }
})
