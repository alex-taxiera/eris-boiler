const {
  Command
} = require('../../../lib')
const {
  status: {
    equalStatuses
  }
} = require('../../../util')

module.exports = new Command({
  name: 'add',
  description: 'Add a status',
  options: {
    parameters: [
      `status in format \`status name|type\` 
      (ex. \`Rocket League|0\`) where type is 0, 1, 2, or 3`
    ]
  },
  run: async (bot, { params }) => {
    const [ name, type ] = params.join(' ').split('|')
    if (!name || !type) {
      return 'Please format the status like name|type (ex. `Rocket League|0`)'
    }
    const newStatus = { name, type }
    const dbStatuses = await bot.sm.getStatuses()
    const statuses = dbStatuses.map((dbStatus) => dbStatus.toJSON())
    if (statuses.some((status) => equalStatuses(status, newStatus))) {
      return 'Status already exists!'
    }
    await bot.sm.addStatus(newStatus)
    return 'Added status!'
  }
})
