const { Command } = require('../../../lib')
const adminOnly = require('../../permissions/admin')
const { inspect } = require('util')

module.exports = new Command({
  name: 'eval',
  description: 'Evaluate Javascript Code',
  aliases: [ 'ev' ],
  options: {
    middleware: adminOnly,
    parameters: [ 'code' ]
  },
  run: async ({ bot, msg, params }) => {
    let evaled
    try {
      const stopwatchStart = process.hrtime()
      evaled = eval(params.join(' ')) // eslint-disable-line no-eval
      if (evaled instanceof Promise) {
        evaled = await evaled
      } // So that We Can resolve the promise
      const stopwatchEnd = process.hrtime(stopwatchStart)

      let response = '' // Woow, an empty string? see below

      response += `**Output:**\n\`\`\`js\n${clean(
        inspect(evaled, { depth: 0 }),
        bot.token
      )}\`\`\``
      response += `\n\n**Type:**\`\`\`${typeof evaled}\`\`\``
      response += `\n\n\n⏱️ \`${(stopwatchEnd[0] * 1e9 + stopwatchEnd[1]) /
        1e6}ms\``

      if (response.length > 0) {
        // To Check if response has something to send xd
        return response
      }
    } catch (err) {
      console.error('Eval Command Error:', err)
      return `Error:\`\`\`xl\n${clean(err, bot.token)}\n\`\`\`` // Error Handling :p
    }
  }
})

// So that, by mistake also, anyone cant see the token ;)
function clean (text, token) {
  if (typeof text === 'string') {
    text = text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)

    return text.replace(new RegExp(token, 'gi'), '****')
  }

  return text
}
