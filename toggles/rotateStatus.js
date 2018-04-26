const Toggle = require('../classes/Toggle.js')

module.exports = (bot) => {
  return new Toggle({
    code: 'rotateStatus',
    name: 'Rotating Status',
    onChange: function (bot, value) {
      if (value) return bot.status.startRotate()
      bot.status.endRotate()
      bot.status.setGame(bot, value)
    }
  }, bot)
}
