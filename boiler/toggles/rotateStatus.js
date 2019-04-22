const { Toggle } = require('../../lib')

module.exports = new Toggle({
  name: 'rotateStatus',
  _onChange: (bot, value) => {
    if (value) return bot.status.startRotate()
    bot.status.endRotate()
    bot.status.setGame(bot, value)
  }
})
