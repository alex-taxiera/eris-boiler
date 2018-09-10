const asyncGoogle = require('util').promisify(require('google'))
const { Command } = require('eris-boiler')

module.exports = (bot) => new Command(
  bot,
  {
    name: 'google',
    description: 'Google something!',
    options: {
      aliases: ['search', 'bing', 'g'],
      parameters: ['query'],
      deleteInvoking: false,
      deleteResponse: false
    },
    run: async function ({ params }) {
      const fullParam = params.join(' ')
      asyncGoogle.resultsPerPage = 25

      const result = await asyncGoogle(fullParam)
        .then((res) => res.links.filter((link) => link.href !== null)[0].href)
        .catch((e) => undefined)

      if (result) return { content: result, delay: -1 }
    }
  }
)
