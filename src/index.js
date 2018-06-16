const DataClient = require('./classes/DataClient.js')
const { readdir } = require('fs').promises
const config = require('./config.json')
const path = require('path')

let bot = new DataClient(config)

/* call start function for an async wrapper */
start().then(() => {
  /* log bot into Discord */
  bot.connect()
})

async function start () {
  /* set up database */
  await bot.dbm.setup(bot)
  const promises = []
  /* require functions made to load modules */
  promises.push(readdir(path.join(__dirname, './loaders/'))
    .then((loaders) => {
      bot.logger.log(`Loading a total of ${loaders.length} loader functions`)
      for (let i = 0; i < loaders.length; i++) {
        const loader = loaders[i].split('.')[0]
        bot[loader] = require(path.join(__dirname, `./loaders/${loaders[i]}`))
        // bot.logger.success(`Loaded ${loader} Function`)
      }
    })
  )

  /* use loader functions */

  /* load commands */
  promises.push(readdir(path.join(__dirname, './commands/'))
    .then((commands) => {
      bot.logger.log(`Loading a total of ${commands.length} commands`)
      for (let i = 0; i < commands.length; i++) {
        bot.loadCommand(bot, commands[i])
      }
    })
  )

  /* load events, bind bot to each event function */
  promises.push(readdir(path.join(__dirname, './events/'))
    .then((events) => {
      bot.logger.log(`Loading a total of ${events.length} events`)
      for (let i = 0; i < events.length; i++) {
        bot.loadEvent(bot, events[i])
      }
    })
  )

  /* load permissions */
  promises.push(readdir(path.join(__dirname, './permissions/'))
    .then((permissions) => {
      bot.logger.log(`Loading a total of ${permissions.length} permissions`)
      for (let i = 0; i < permissions.length; i++) {
        bot.loadPermission(bot, permissions[i])
      }
    })
  )

  /* load settings */
  promises.push(readdir(path.join(__dirname, './settings/'))
    .then((settings) => {
      bot.logger.log(`Loading a total of ${settings.length} settings`)
      for (let i = 0; i < settings.length; i++) {
        bot.loadSetting(bot, settings[i])
      }
    })
  )

  /* load toggles */
  promises.push(readdir(path.join(__dirname, './toggles/'))
    .then((toggles) => {
      bot.logger.log(`Loading a total of ${toggles.length} toggleable settings`)
      for (let i = 0; i < toggles.length; i++) {
        bot.loadToggle(bot, toggles[i])
      }
    })
  )
  await Promise.all(promises)
}
