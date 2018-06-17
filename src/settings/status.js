const Setting = require('../classes/Setting.js')

module.exports = (bot) => new Setting(
  bot,
  {
    code: 'status',
    name: 'Default Status',
    onChange: (bot, value) => {
      value = { name: value, type: 0 }
      bot.dbm.updateDefaultStatus(value)
      if (bot.toggles.get('rotateStatus').value) return
      bot.status.setStatus(bot, value)
    }
  }
)
