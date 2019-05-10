const { Command } = require('eris-boiler')

module.exports = new Command({
  name: 'echo',
  description: 'copy that',
  run: async ({ params }) => params.join(' ')
})
