const Command = require('./Command.js')

module.exports = new Command({
  name: 'help',
  description: 'Displays this message, duh!',
  parameters: [],
  permission: 'Anyone',
  run: async function ({ msg, commands }) {
    let content = 'Available commands:'
    for (let key in commands) {
      if (!commands.hasOwnProperty(key)) continue
      let c = commands[key]
      content += `\n${key} (${c.permission})`
      for (let j = 0; j < c.parameters.length; j++) {
        content += ` <${c.parameters[j]}>`
      }
      content += `: ${c.description}`
    }

    try {
      let dm = await msg.author.getDMChannel()
      dm.createMessage(content)
      return { content: 'Command list sent!' }
    } catch (e) {
      return { content }
    }
  }
})
