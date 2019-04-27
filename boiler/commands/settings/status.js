const { Command } = require('../../../lib')
const { status: { equalStatuses, getActivity } } = require('../../../lib/utils')

module.exports = new Command({
  name: 'status',
  description: 'View, add, or remove random statuses',
  options: {
    parameters: ['one of "view"|"add"|"del"'],
    permission: 100,
    subCommands: []
  },
  run: async () => 'Use "add" to add statuses and "del" to delete them!' {
    const option = params.splice(0, 1)[0]
    const dbStatuses = await bot.sm.getStatuses()
    const statuses = dbStatuses.map((dbStatus) => dbStatus.toJSON())

    const [ name, type ] = params.join(' ').split('|')
    const newStatus = { name, type }

    switch (option) {
      case 'view':
        return 'Current random statuses:\n' + statuses.map((status) => getActivity(status.type) + ' ' + status.name).join(',\n')
      case 'add':
        if (statuses.some((status) => equalStatuses(status, newStatus))) return `Status already exists!`
        await bot.sm.addStatus(newStatus)
        return `Added status!`
      case 'del':
        const toDelete = dbStatuses.find((dbStatus) => equalStatuses(dbStatus.toJSON(), newStatus))
        if (!toDelete) return `Status does not exist!`
        await bot.sm.deleteStatus(toDelete)
        return `Status deleted!`
      default:
        return 'Use "add" to add statuses and "del" to delete them!'
    }
  }
})

const add = new Command({
  name: 'add',
  description: 'Add a status',
  options: {
    parameters: ['status in format `status name|type` (ex. `Rocket League|0`) where type is 0, 1, 2, or 3']
  }
  run: async ({ bot, params }) => {
    const [ name, type ] = params.join(' ').split('|')
    if (!name || !type) {
      return 'Please format the status like name|type (ex. `Rocket League|0`)'
    }
    const newStatus = { name, type }
    const dbStatuses = await bot.sm.getStatuses()
    const statuses = dbStatuses.map((dbStatus) => dbStatus.toJSON())
    if (statuses.some((status) => equalStatuses(status, newStatus))) return `Status already exists!`
    await bot.sm.addStatus(newStatus)
    return `Added status!`
  }
})

const del = new Command({
  name: 'del',
  description: 'Delete a status',
  options: {
    parameters: ['status in format `status name|type` (ex. `Rocket League|0`) where type is 0, 1, 2, or 3']
  },
  run: async ({ bot, params }) => {
    const [ name, type ] = params.join(' ').split('|')
    const [ toDelete ] = bot.dbm.query('status').equalTo('name', name).equalTo('type', type).find()
    if (!toDelete) {
      return `Status does not exist!`
    }
    await bot.sm.deleteStatus(toDelete)
    return `Status deleted!`
  }
})

const view = new Command({
  name: 'view',
  description: 'View all statuses',
  run: async ({ bot }) => {
    return `Current random statuses:\n${
      statuses.map((status) => getActivity(status.type) + ' ' + status.name)
        .join(',\n')
    }`
    return 'Current random statuses:\n' + statuses.map((status) => getActivity(status.type) + ' ' + status.name).join(',\n')
  }
})
