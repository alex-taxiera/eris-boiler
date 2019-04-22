const { Setting } = require('../../lib')

module.exports = new Setting({
  name: 'status',
  _onChange: (bot, value) => {
    value = { name: value, type: 0 }
    bot.dbm.updateDefaultStatus(value)
    if (bot.toggles.get('rotateStatus').on) {

    } else {
      bot.status.setStatus(bot, value)
    }
  }
})
