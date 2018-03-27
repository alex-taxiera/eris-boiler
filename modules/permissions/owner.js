const Permission = require('./Permission.js')

module.exports = new Permission({
  name: 'Owner',
  check: (member) => member.id === member.guild.ownerID,
  deny: () => 'Must be guild owner!'
})
