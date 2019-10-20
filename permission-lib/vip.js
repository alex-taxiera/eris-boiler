const { Permission } = require('../lib')

module.exports = new Permission({
  level: 50,
  run: async ({ msg: { member }, bot }) => {
    const dbGuild = await bot.dbm.newQuery('guild').get(member.guild.id)
    const { vip } = dbGuild.toJSON()
    return vip && member.roles.includes(vip)
  }
})
