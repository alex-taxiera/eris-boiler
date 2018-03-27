const Permission = require('./Permission.js')

module.exports = new Permission({
  name: 'Anyone',
  check: () => true,
  deny: () => undefined
})
