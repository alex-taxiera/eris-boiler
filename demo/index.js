require('dotenv').load()
const { DataClient } = require('../')
const token = process.env.TOKEN

const bot = new DataClient({ token, sourceFolder: './demo' })
/* log bot into Discord */
bot.connect()
