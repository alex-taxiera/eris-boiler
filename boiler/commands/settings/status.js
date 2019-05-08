const { Command } = require('../../../lib')
const subCommands = require('./statusOptions')

module.exports = new Command({
  name: 'status',
  description: 'View, add, or remove random statuses',
  options: {
    parameters: [ 'one of "view"|"add"|"del"' ],
    permission: 100,
    subCommands
  },
  run: async () => 'Use "add" to add statuses and "del" to delete them!'
})
