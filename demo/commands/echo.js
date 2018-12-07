const { Command } = require('../../lib')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'echo',
    description: 'copy that',
    run: async ({ params }) => params.join(' ')
  }
)
