const { config: envLoad } = require('dotenv')
const { join } = require('path')
envLoad() // load .env file

const {
  DataClient,
  SQLManager
} = require('eris-boiler')

const {
  DISCORD_TOKEN,
  EB_DATABASE_URL,
  EB_DB_CLIENT,
  EB_DB_NAME,
  EB_DB_USER,
  EB_DB_PASS,
  EB_DB_HOST
} = process.env

/* pass database info to sql database manager */
const databaseManager = new SQLManager({
  dbInfo: {
    connectionInfo: EB_DATABASE_URL || {
      database: EB_DB_NAME,
      user: EB_DB_USER,
      password: EB_DB_PASS,
      host: EB_DB_HOST
    },
    client: EB_DB_CLIENT
  }
})

/* create DataClient instance */
const bot = new DataClient(DISCORD_TOKEN, {
  databaseManager
})

bot
  .addCommands(join(__dirname, 'src/commands')) // load commands in commands folder
  .connect()                                    // login to discord
