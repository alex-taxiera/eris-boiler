const Permission = require('../classes/Permission.js')

module.exports = new Permission({
  name: 'Guild Owner',
  level: 80,
  check: async (member) => member.id === member.guild.ownerID,
  deny: () => 'Must be guild owner!'
})
