const { Setting } = require('../classes')

module.exports = new Setting({
  name: 'prefix',
  prettyName: 'Default Prefix',
  _onChange: (bot, value) => null
})
