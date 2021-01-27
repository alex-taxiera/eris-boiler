const { Permission } = require('../lib')

module.exports = new Permission({
  level: 999,
  run: (bot, { msg }) => bot.owners.some(({ id }) => id === msg.author.id)
})
