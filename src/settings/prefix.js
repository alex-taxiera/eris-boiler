const { Setting } = require('../lib')

module.exports = new Setting({
  name: 'prefix',
  prettyName: 'Default Prefix',
  _onChange: (bot, value) => null
})
