const Toggle = require('../classes/Toggle.js')

module.exports = (bot) => new Toggle(
  bot,
  {
    code: 'rotateStatus',
    name: 'Rotating Status',
    onChange: (bot, value) => {
      if (value) return bot.status.startRotate()
      bot.status.endRotate()
      bot.status.setGame(bot, value)
    }
  }
)
