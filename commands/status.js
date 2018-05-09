const Command = require('../classes/Command.js')

module.exports = new Command({
  name: 'status',
  description: 'View, add, or remove random statuses',
  parameters: ['"view"|"add"|"del" status to add or delete'],
  permission: 'Admin',
  run: async ({ msg, params, bot }) => {
    const option = params.splice(0, 1)[0]
    const fullParam = params.join(' ')
    const statuses = await bot.dbm.getStatuses() || []
    const names = statuses.map((val) => val.name)

    switch (option) {
      case 'view':
        return 'Current random statuses:\n' + names.join(',\n')
      case 'add':
      // TODO: maybe supply type with name? maybe too complicated
        if (statuses.includes(fullParam)) return `Statuses already includes "${fullParam}"`
        await bot.dbm.addStatus(fullParam)
        return `${fullParam} added!`
      case 'del':
        if (!statuses.includes(fullParam)) return `Statuses does not include "${fullParam}"`
        await bot.dbm.removeStatus(fullParam)
        return `${fullParam} deleted!`
      // TODO: edit option, change name or type
      default:
        return 'Use "add" to add statuses and "del" to delete them!'
    }
  }
})
