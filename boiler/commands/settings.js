const { Command } = require('../../lib')
const subCommands = require('./settings')

module.exports = new Command({
  name: 'settings',
  description: 'Change some settings for your guild :)',
  options: {
    permission: 60,
    subCommands
  },
  run: ({ msg }) => sendHelp(msg, this.info)
})

async function sendHelp (msg, content) {
  return msg.author.getDMChannel()
    .then((dm) => dm.createMessage(content))
    .then((success) => 'DM sent.')
    .catch((e) => content)
}
