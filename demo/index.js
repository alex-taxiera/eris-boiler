require('dotenv').load()
const { DataClient } = require('../')

const bot = new DataClient('./demo')
/* log bot into Discord */
bot.connect()
