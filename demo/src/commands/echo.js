const { Command } = require('../../lib')

module.exports = new Command({
  name: 'echo',
  description: 'copy that',
  run: async ({ params }) => params.join(' ')
})
