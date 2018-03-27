const Permission = require('./Permission.js')
const database = require('../database.js')

module.exports = new Permission({
  name: 'VIP',
  check: async (member) => {
    // TODO get vip from db
    const { vip } = await database.getClient(member.guild.id)
    if (vip && member.roles.includes(vip)) return true
    return false
  },
  deny: () => 'Must be VIP!'
})
