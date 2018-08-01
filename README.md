# eris-boiler

[![discord](https://img.shields.io/badge/-chat%20on%20discord-b.svg?colorA=697ec4&colorB=7289da&logo=discord)](https://discordapp.com/invite/4SkAduM)
[![Maintainability](https://api.codeclimate.com/v1/badges/586014eefb135a4c51a1/maintainability)](https://codeclimate.com/github/alex-taxiera/eris-boiler/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/586014eefb135a4c51a1/test_coverage)](https://codeclimate.com/github/alex-taxiera/eris-boiler/test_coverage)

A Discord bot boilerplate using JavaScript and the [Eris](https://abal.moe/Eris/) library.

## Installation
Refer to latest release

## Talk to us!
The [discord](https://discordapp.com/invite/4SkAduM) chat is the best place to communicate. We encourage using it for:
- Asking for help
- Asking if something is a bug
- Proposing ideas
- And anything else you can think of

## Documentation
Class documentation can be found [here](https://alex-taxiera.github.io/eris-boiler/)


## Usage
NOTE: This has only been tested with MySQL/MariaDB, but should also work with PostgreSQL
```js
// index.js
require('dotenv').load() // load .env
const { DataClient } = require('eris-boiler')

const bot = new DataClient({sourceFolder: './src'}) // specify files live in ./src
bot.connect()
```
```js
// .env
TOKEN=XXX
DB_NAME=my-bot
DB_USER=user
DB_PASS=pass
```
```js
// src/commands/echo.js
const { Command } = require('eris-boiler')
// commands must export a function bringing bot into the constructor
module.exports = (bot) => new Command(
  bot,
  {
    name: 'echo', // name of command
    description: 'copy that',
    run: async ({ params }) => params.join(' ') // functionality of command
    // list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
  }
)
```
```js
// src/events/presenceUpdate.js
// event files should be named by event name
const { Event } = require('eris-boiler')

module.exports = new Event({
  name: 'presenceUpdate', // name should match event name
  run: (bot, newMember, oldMember) => bot.logger.warn('something changed')
  // bot is bound to all events, so bot will be the first parameter in addition to any parameters passed in from Eris
})
```
That should cover most things anyone starting out should need to know.

## Contributing
Before starting work you should hash it out with us over on [discord](https://discordapp.com/invite/4SkAduM) to make sure it is not already being worked on by someone else.

Check out our guidelines [here.](/CONTRIBUTING.md)

## Development
1. Clone this repository
2. Create a `.env` in the root folder (use `config/sample.env` as a guide)
3. Run `npm install`
4. Run `npm run dev`
