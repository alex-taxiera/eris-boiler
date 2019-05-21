const { Permission } = require('../../lib')

module.exports = new Permission({
  run: ({ msg, bot }) => msg.member.id === bot.ownerID
})
