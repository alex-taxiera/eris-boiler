const { Command } = require('../../../lib')
const { admin: permission } = require('../../../permission-lib')

const add = require('./add')
const del = require('./del')
const view = require('./view')

module.exports = new Command({
  name: 'status',
  description: 'View, add, or remove random statuses',
  options: {
    parameters: [ 'one of "view"|"add"|"del"' ],
    permission,
    subCommands: [
      add,
      del,
      view
    ]
  },
  run: async () => 'Use "add" to add statuses and "del" to delete them!'
})
