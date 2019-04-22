const { Setting } = require('../../lib')

module.exports = new Setting({
  name: 'prefix',
  _onChange: (bot, value) => null
})
