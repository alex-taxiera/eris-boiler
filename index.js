const Eris = require('eris')
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)
const config = require('./config.json')
const path = require('path')

let bot = new Eris(config.TOKEN)

/* add modules to bot */
bot = Object.assign(bot, {
  config,
  logger: new (require('./classes/Logger.js'))(),
  dbm: new (require('./classes/DatabaseManager.js'))(config.DB_CREDENTIALS),
  status: new (require('./classes/Status.js'))(),
  commands: new Map(),
  aliases: new Map(),
  permissions: new Map(),
  settings: new Map(),
  toggles: new Map()
})

/* call start function for an async wrapper */
start()

async function start () {
  /* set up database */
  const db1 = bot.dbm._knex.schema.hasTable('guild_settings')
  .then((exists) => {
    if (exists) return
    return bot.dbm._knex.schema.createTable('guild_settings', (table) => {
      table.charset('utf8')
      table.string('id').primary()
      table.string('vip')
      table.string('prefix').defaultTo(bot.config.DEFAULT.prefix)
    })
  })

  const db2 = bot.dbm._knex.schema.hasTable('guild_toggles')
  .then((exists) => {
    if (exists) return
    return bot.dbm._knex.schema.createTable('guild_toggles', (table) => {
      table.charset('utf8')
      table.string('id').primary()
      // add toggleable values
    })
  })

  const db3 = bot.dbm._knex.schema.hasTable('statuses')
  .then((exists) => {
    if (exists) return
    return bot.dbm._knex.schema.createTable('statuses', (table) => {
      table.charset('utf8')
      table.string('name').primary()
      table.integer('type').defaultTo(0)
      table.boolean('default').defaultTo('false')
    })
    .then(() => {
      bot.dbm._insert({ table: 'statuses', data: bot.config.DEFAULT.status })
    })
  })

  await Promise.all([db1, db2, db3])

  /* require functions made to load modules */
  const loaders = await readdir(path.join(__dirname, './loaders/'))
  bot.logger.log(`Loading a total of ${loaders.length} loader functions`)
  for (let i = 0; i < loaders.length; i++) {
    const loader = loaders[i].split('.')[0]
    bot[loader] = require(path.join(__dirname, `./loaders/${loaders[i]}`))
    bot.logger.success(`Loaded ${loader} Function`)
  }

  /* use loader functions */

  /* load commands */
  const commands = await readdir(path.join(__dirname, './commands/'))
  bot.logger.log(`Loading a total of ${commands.length} commands`)
  for (let i = 0; i < commands.length; i++) {
    bot.loadCommand(bot, commands[i])
  }

  /* load events, bind bot to each event function */
  const events = await readdir(path.join(__dirname, './events/'))
  bot.logger.log(`Loading a total of ${events.length} events`)
  for (let i = 0; i < events.length; i++) {
    bot.loadEvent(bot, events[i])
  }

  /* load permissions */
  const permissions = await readdir(path.join(__dirname, './permissions/'))
  bot.logger.log(`Loading a total of ${permissions.length} permissions`)
  for (let i = 0; i < permissions.length; i++) {
    bot.loadPermission(bot, permissions[i])
  }

  /* load settings */
  const settings = await readdir(path.join(__dirname, './settings/'))
  bot.logger.log(`Loading a total of ${settings.length} settings`)
  for (let i = 0; i < settings.length; i++) {
    bot.loadSetting(bot, settings[i])
  }

  /* load toggles */
  const toggles = await readdir(path.join(__dirname, './toggles/'))
  bot.logger.log(`Loading a total of ${toggles.length} toggleable settings`)
  for (let i = 0; i < toggles.length; i++) {
    bot.loadToggle(bot, toggles[i])
  }

  /* log bot into Discord */
  bot.connect()
}
