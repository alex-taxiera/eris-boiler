require('dotenv').load()
const DataClient = require('../lib/data-client')
const {
  TOKEN,
  DATABASE_URL,
  DB_CLIENT,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST
} = process.env

const bot = new DataClient({
  statusTimer: 5000,
  token: TOKEN,
  sourceFolder: './demo',
  qbOptions: {
    data: {
      connectionInfo: DATABASE_URL || {
        DB_NAME,
        DB_USER,
        DB_PASS,
        DB_HOST
      },
      client: DB_CLIENT
    }
  }
})
/* log bot into Discord */
bot.connect()
