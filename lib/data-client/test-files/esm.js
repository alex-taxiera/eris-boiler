const Command = require('../../command')

module.exports = {
  __esModule: true,
  default: new Command({
    name: 'echo',
    description: 'copy that',
    run: async ({ params }) => params.join(' ')
  })
}
