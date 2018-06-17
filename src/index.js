const DataClient = require('./classes/DataClient.js')
const config = require('./config.json')

let bot = new DataClient(config)
/* log bot into Discord */
bot.connect()
