const { Permission } = require('../lib')

module.exports = new Permission({
  level: 100,
  run: async ({ msg: { member } }) => member.id === member.guild.ownerID
})
