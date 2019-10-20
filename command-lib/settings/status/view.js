const {
  Command,
  Utils: {
    status: {
      getActivity
    }
  }
} = require('../../../lib')

module.exports = new Command({
  name: 'view',
  description: 'View all statuses',
  run: async ({ bot }) => {
    const dbStatuses = await bot.sm.getStatuses()
    const statuses = dbStatuses.map((dbStatus) => dbStatus.toJSON())
    return `Current random statuses:\n${
      statuses.map((status) => getActivity(status.type) + ' ' + status.name)
        .join(',\n')
    }`
  }
})
