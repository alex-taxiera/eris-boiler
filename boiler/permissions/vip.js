const { Permission } = require('../../lib')

module.exports = new Permission({
  name: 'VIP',
  level: 60,
  check: async (member, bot) => {
    const dbGuild = await bot.dbm.query('guild').get(member.guild.id)
    const { vip } = dbGuild.toJSON()
    return vip && member.roles.includes(vip)
  }
})
