require('dotenv').load()
const DataClient = require('../src/classes/DataClient.js')

const bot = new DataClient()
/* log bot into Discord */
bot.connect()
