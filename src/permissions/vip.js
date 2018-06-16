const Permission = require('../classes/Permission.js')

module.exports = new Permission({
  name: 'VIP',
  level: 60,
  check: async (member, bot) => {
    const { vip } = await bot.dbm.getSettings(member.guild.id)
    if (vip && member.roles.includes(vip)) return true
    return false
  }
})
