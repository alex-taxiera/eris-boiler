const Setting = require('../classes/Setting.js')

module.exports = (bot) => {
  return new Setting(
    bot,
    {
      code: 'prefix',
      name: 'Default Prefix',
      onChange: function (bot, value) {
        bot.dbm.updateDefaultPrefix(value)
      }
    }
  )
}
