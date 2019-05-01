const dotenv = require('dotenv')
const { resolve } = require('path')
dotenv.config()

const {
  DataClient,
  SQLManager
} = require('../lib') // same as require('eris-boiler')

const {
  TOKEN,
  DATABASE_URL,
  DB_CLIENT,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST
} = process.env

const databaseManager = new SQLManager({
  qbOptions: {
    connectionInfo: DATABASE_URL || {
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASS,
      host: DB_HOST
    },
    client: DB_CLIENT
  }
})

const bot = new DataClient(TOKEN, {
  // sourcePath: resolve(__dirname, './'),
  databaseManager
})
/* log bot into Discord */
bot.connect()
