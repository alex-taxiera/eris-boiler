require('dotenv').load()
const { DataClient } = require('../')

const bot = new DataClient()
/* log bot into Discord */
bot.connect()
