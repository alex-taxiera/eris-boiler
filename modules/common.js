const database = require('./database.js')
const rng = require('seedrandom')()
const moment = require('moment')
const colors = require('colors')

function log (str, color, err) {
  if (typeof str !== 'string') str = str.toString()

  console.log(colors.gray(`${moment().format('MM/DD HH:mm:ss')}`) + ' | ' +
  colors[color](`BZZT ${str.toUpperCase()} BZZT`))
  if (err) console.log(colors.red(err))
}

async function setGame ({ name, bot }) {
  if (!name) {
    const games = await database.getGames() || []
    const { defaultGame } = await database.getSettings()
    if (defaultGame) games.push({ name: defaultGame })
    name = games[Math.floor(rng() * games.length)].name
  }
  log(`playing ${name}`, 'cyan')
  bot.editStatus('online', { name })
  // setTimeout(() => autoGame(), 43200000) // 43200000
}

module.exports = { log, setGame }
