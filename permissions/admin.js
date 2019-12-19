const { Permission } = require('../lib')

module.exports = new Permission({
  level: 999,
  run: ({ msg, bot }) => msg.member.id === bot.ownerID
})
