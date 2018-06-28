const Setting = require('../classes/Setting.js')

module.exports = (bot) => new Setting(
  bot,
  {
    name: 'prefix',
    prettyName: 'Default Prefix',
    _onChange: (bot, value) => bot.dbm.updateDefaultPrefix(value)
  }
)
