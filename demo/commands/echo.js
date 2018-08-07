const { Command } = require('eris-boiler')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'echo',
    description: 'copy that',
    run: async ({ params }) => params.join(' ')
  }
)
