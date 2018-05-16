const Command = require('../classes/Command.js')

module.exports = (bot) => {
  return new Command(
    bot,
    {
      name: 'status',
      description: 'View, add, or remove random statuses',
      options: {
        parameters: ['"view"|"add"|"del" status to add or delete'],
        permission: 'Admin'
      },
      run: async ({ msg, params, bot }) => {
        const option = params.splice(0, 1)[0]
        const fullParam = params.join(' ')
        const statuses = await bot.dbm.getStatuses() || []
        const names = statuses.map((val) => val.name)

        switch (option) {
          case 'view':
            return 'Current random statuses:\n' + names.join(',\n')
          case 'add':
            if (statuses.includes(fullParam)) return `Statuses already includes "${fullParam}"`
            await bot.dbm.addStatus(fullParam)
            return `${fullParam} added!`
          case 'del':
            if (!statuses.includes(fullParam)) return `Statuses does not include "${fullParam}"`
            await bot.dbm.removeStatus(fullParam)
            return `${fullParam} deleted!`
          default:
            return 'Use "add" to add statuses and "del" to delete them!'
        }
      }
    }
  )
}
