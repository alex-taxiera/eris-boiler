# eris-boiler

[![discord](https://canary.discordapp.com/api/guilds/463886367496339458/widget.png)](https://discordapp.com/invite/eqwAFJWM)
[![Build Status](https://travis-ci.com/alex-taxiera/eris-boiler.svg?branch=master)](https://travis-ci.com/alex-taxiera/eris-boiler)
[![Maintainability](https://api.codeclimate.com/v1/badges/586014eefb135a4c51a1/maintainability)](https://codeclimate.com/github/alex-taxiera/eris-boiler/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/586014eefb135a4c51a1/test_coverage)](https://codeclimate.com/github/alex-taxiera/eris-boiler/test_coverage)

A Discord bot framework for JavaScript and the [Eris](https://abal.moe/Eris/) library.

## Installation
`npm install eris-boiler`

## Talk to us!
The [discord](https://discord.gg/eqwAFJW) chat is the best place to communicate. We encourage using it for:
- Asking for help
- Asking if something is a bug
- Proposing ideas
- And anything else you can think of

## Documentation
Class documentation can be found [here](https://alex-taxiera.github.io/eris-boiler/)


## Usage
```js
// index.js
const { join } = require('path')
const { DataClient } = require('eris-boiler')

/* create DataClient instance */
const options = {
  oratorOptions: {
    defaultPrefix: '!!' // sets the default prefix to !!
  },
  statusManagerOptions: {
    defaultStatus: { // sets default discord activity
      type: 0,
      name: 'a game'
    },
    mode: 'random' // sets activity mode to random, the bot will change status on an interval
  }
}

const bot = new DataClient('YourBotToken', options)

bot
  .addCommands(join(__dirname, 'src/commands')) // load commands in src/commands folder
  .addEvents(join(__dirname, 'src/events')) // load events in src/events folder
  .connect()      
```
```js
// src/commands/echo.js
const { Command } = require('eris-boiler')

module.exports = new Command({
  name: 'echo', // name of command
  description: 'copy that',
  run: async ({ params }) => params.join(' ') // functionality of command
  // list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
})
```
```js
// src/events/presenceUpdate.js
const { DiscordEvent } = require('eris-boiler')

module.exports = new DiscordEvent({
  name: 'presenceUpdate', // name should match event name
  run: (bot, newMember, oldMember) => console.log('something changed')
  // bot is bound to all events, so bot will be the first parameter in addition to any parameters passed in from Eris
})
```
That should cover most things anyone starting out should need to know.

## Contributing
Before starting work you should hash it out with us over on [discord](https://discord.gg/eqwAFJW) to make sure it is not already being worked on by someone else.

Check out our guidelines [here.](/CONTRIBUTING.md)

## Development
1. Clone this repository
2. Run `npm install`
3. Add your token and other options
4. Run `npm run dev`
