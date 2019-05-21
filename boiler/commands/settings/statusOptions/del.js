const { Command } = require('../../../../lib')

module.exports = new Command({
  name: 'del',
  description: 'Delete a status',
  options: {
    parameters: [
      `status in format \`status name|type\` (ex. \`Rocket League|0\`) 
      where type is 0, 1, 2, or 3`
    ]
  },
  run: async ({ bot, params }) => {
    const [ name, type ] = params.join(' ').split('|')
    const [ toDelete ] = bot.dbm.newQuery('status')
      .equalTo('name', name)
      .equalTo('type', type)
      .find()

    if (!toDelete) {
      return `Status does not exist!`
    }
    await bot.sm.deleteStatus(toDelete)
    return `Status deleted!`
  }
})
