const Setting = require('../classes/Setting.js')

module.exports = (bot) => new Setting(
  bot,
  {
    code: 'status',
    name: 'Default Status',
    onChange: (bot, value) => {
      bot.dbm.updateDefaultStatus(value)
      if (bot.settings.rotateStatus.value) return
      bot.status.setGame(bot, value)
    }
  }
)
