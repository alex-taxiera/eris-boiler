const { DataClient } = require('eris-boiler')
const { join } = require('path')
require('dotenv').config()

const client = new DataClient(process.env.CLIENT_TOKEN)

client
  .addCommands(join(__dirname, 'commands'))
  .connect()
