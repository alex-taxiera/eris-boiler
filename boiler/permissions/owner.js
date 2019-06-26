const { Permission } = require('../../lib')

module.exports = new Permission({
  run: async ({ msg: { member } }) => member.id === member.guild.ownerID
})
