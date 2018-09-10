const { Permission } = require('../classes')

module.exports = new Permission({
  name: 'Guild Owner',
  level: 80,
  check: async (member) => member.id === member.guild.ownerID
})
