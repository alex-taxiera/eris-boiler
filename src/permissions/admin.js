const Permission = require('../classes/Permission.js')

module.exports = new Permission({
  name: 'Admin',
  level: 100,
  check: async (member, bot) => member.id === (await bot.getOAuthApplication()).owner.id,
  deny: () => 'Must be bot owner!'
})
