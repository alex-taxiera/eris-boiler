const { Setting } = require('../../lib')

module.exports = new Setting({
  name: 'status',
  prettyName: 'Default Status',
  _onChange: (bot, value) => {
    value = { name: value, type: 0 }
    bot.dbm.updateDefaultStatus(value)
    if (bot.toggles.get('rotateStatus').value) return
    bot.status.setStatus(bot, value)
  }
})
