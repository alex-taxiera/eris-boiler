const Setting = require('../classes/Setting.js')

module.exports = (bot) => new Setting(
  bot,
  {
    code: 'prefix',
    name: 'Default Prefix',
    onChange: (bot, value) => bot.dbm.updateDefaultPrefix(value)
  }
)
