const database = require('../database.js')
const Command = require('./Command.js')

module.exports = new Command({
  name: 'globalGames',
  description: 'View, add, or remove random games',
  parameters: ['<view|add|del> <game name to add or delete>'],
  permission: 'Admin',
  run: async ({ msg, params }) => {
    let option = params.splice(0, 1)[0]
    let fullParam = params.join(' ')
    let games = await database.getGames() || []

    switch (option) {
      case 'view':
        return 'Current random games:\n' + games.join(',\n')
      case 'add':
        if (games.includes(fullParam)) return `Games already includes "${fullParam}"`
        database.addGame(fullParam)
        return `${fullParam} added!`
      case 'del':
        if (!games.includes(fullParam)) return `Games does not include "${fullParam}"`
        database.delGame(fullParam)
        return `${fullParam} deleted!`
      default:
        return 'Use "add" to add games and "del" to delete games!'
    }
  }
})
