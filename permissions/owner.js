const { Permission } = require('../lib')

module.exports = new Permission({
  level: 100,
  run: async (bot, { msg: { member } }) => {
    if (!member) {
      return false
    }

    return member.id === member.guild.ownerID
  }
})
