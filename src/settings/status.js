const Setting = require('../classes/Setting.js')

module.exports = (bot) => {
  return new Setting(
    bot,
    {
      code: 'status',
      name: 'Default Status',
      onChange: function (bot, value) {
        bot.dbm.updateDefaultStatus(value)
        if (bot.settings.rotateStatus.value) return
        bot.status.setGame(bot, value)
      }
    }
  )
}
