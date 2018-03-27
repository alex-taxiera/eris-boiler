const Permission = require('./Permission.js')

module.exports = new Permission({
  name: 'Admin',
  check: async (member) => {
    const app = await require('../../bot.js').getOAuthApplication()
    return member.id === app.owner.id
  },
  deny: () => 'Must be bot owner!'
})
