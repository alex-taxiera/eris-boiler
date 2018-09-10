require('dotenv').load()
const { DataClient } = require('../')

const bot = new DataClient({sourceFolder: './demo'})
/* log bot into Discord */
bot.connect()
