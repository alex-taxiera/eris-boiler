const database = require('../database.js')
const common = require('../common.js')
const Command = require('./Command.js')

module.exports = new Command({
  name: 'global',
  description: 'View and/or set global options',
  parameters: ['"defaultPrefix|defaultGame|randomGames" <set> <value to set to>'],
  permission: 'Admin',
  run: async ({ msg, params, bot }) => {
    const { defaultPrefix, defaultGame, randomGames } = await database.getSettings()

    let option = params.splice(0, 1)[0]
    let set
    if (params[0] === 'set') set = params.splice(0, 1)[0]
    let fullParam = params.join(' ')

    switch (option) {
      case 'defaultPrefix':
        if (!set) return `The default prefix is "${defaultPrefix}"`
        if (defaultPrefix === fullParam) return `Default prefix is already set to "${fullParam}"`
        database.updateSettings({ defaultPrefix: fullParam })
        return 'defaultPrefix set!'
      case 'defaultGame':
        if (!set) return `The default game is "${defaultGame}"`
        if (defaultGame === fullParam) return `Default game is already set to "${fullParam}"`
        database.updateSettings({ defaultGame: fullParam })
        if (!randomGames) common.setGame(fullParam, bot)
        return 'defaultGame set!'
      case 'randomGames':
        if (!set) return `Random Games is set to "${randomGames}"`
        switch (params[0]) {
          case 'true':
            if (randomGames) return `Random Games is already "true"`
            // TODO do not set to true if there are no games
            // TODO run setGame
            database.updateSettings({ defaultGame: true })
            return 'defaultGame set!'
          case 'false':
            if (randomGames) return `Random Games is already "false"`
            database.updateSettings({ defaultGame: false })
            return 'defaultGame set!'
          default:
            return 'Set randomGames to "true" or "false"'
        }
      default:
        return 'Specify option with first param!'
    }
  }
})
