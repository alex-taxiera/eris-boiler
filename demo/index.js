const { config: envLoad } = require('dotenv')
const { resolve } = require('path')
envLoad() // load .env file

const {
  DataClient,
  SQLManager
} = require('eris-boiler')

const {
  TOKEN,
  DATABASE_URL,
  DB_CLIENT,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST
} = process.env

/* pass database info to sql database manager */
const databaseManager = new SQLManager({
  dbInfo: {
    connectionInfo: DATABASE_URL || {
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASS,
      host: DB_HOST
    },
    client: DB_CLIENT
  }
})

/* create DataClient instance */
const bot = new DataClient(TOKEN, {
  sourcePath: resolve(__dirname, './src'), // absolute path to source folder (only needed because we linked to a local package)
  databaseManager
})

/* log bot into Discord */
bot.connect()
