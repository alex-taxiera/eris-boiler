require('dotenv').load({ path: '../config/.env' })
const DataClient = require('../src/classes/DataClient.js')
const config = process.env

let bot = new DataClient(config)
/* log bot into Discord */
bot.connect()
