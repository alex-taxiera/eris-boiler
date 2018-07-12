const Setting = require('../classes/Setting.js')

module.exports = new Setting({
  name: 'prefix',
  prettyName: 'Default Prefix',
  _onChange: (bot, value) => bot.dbm.updateDefaultPrefix(value)
})
