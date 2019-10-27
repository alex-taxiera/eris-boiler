const { Command } = require('eris-boiler')

module.exports = new Command({
  name: 'echo',
  description: 'Echos your provided input...',
  aliases: [ 'say', 'repeat' ],
  async run ({ msg, params }) {
    if (params.length === 0) {
      return 'Give me something to repeat'
    } else {
      return `<@${msg.author.id}> said, ${params.join(' ')}`
    }
  }
})
