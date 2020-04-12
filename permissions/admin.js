const { Permission } = require('../lib')

module.exports = new Permission({
  level: 999,
  run: (bot, { msg }) => msg.author.id === bot.ownerID
})
