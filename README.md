# eris-boiler

[![discord](https://canary.discordapp.com/api/guilds/463886367496339458/widget.png)](https://discordapp.com/invite/4SkAduM)
[![Build Status](https://travis-ci.com/alex-taxiera/eris-boiler.svg?branch=master)](https://travis-ci.com/alex-taxiera/eris-boiler)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=alex-taxiera_eris-boiler&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=alex-taxiera_eris-boiler)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=alex-taxiera_eris-boiler&metric=coverage)](https://sonarcloud.io/dashboard?id=alex-taxiera_eris-boiler)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=alex-taxiera_eris-boiler&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=alex-taxiera_eris-boiler)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=alex-taxiera_eris-boiler&metric=security_rating)](https://sonarcloud.io/dashboard?id=alex-taxiera_eris-boiler)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=alex-taxiera_eris-boiler&metric=ncloc)](https://sonarcloud.io/dashboard?id=alex-taxiera_eris-boiler)

A Discord bot framework for JavaScript and the [Eris](https://abal.moe/Eris/) library.

## Installation
`npm install eris-boiler`

## Talk to us!
The [discord](https://discordapp.com/invite/4SkAduM) chat is the best place to communicate. We encourage using it for:
- Asking for help
- Asking if something is a bug
- Proposing ideas
- And anything else you can think of

## Documentation
Class documentation can be found [here](https://alex-taxiera.github.io/eris-boiler/)


## Usage
```js
// index.js
const { resolve } = require('path')
const { DataClient } = require('eris-boiler')

const bot = new DataClient('YourBotToken', {
  sourcePath: resolve(__dirname, './src') // absolute path to your source files
})

bot.connect()
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
const { Event } = require('eris-boiler')

module.exports = new Event({
  name: 'presenceUpdate', // name should match event name
  run: (bot, newMember, oldMember) => console.log('something changed')
  // bot is bound to all events, so bot will be the first parameter in addition to any parameters passed in from Eris
})
```
That should cover most things anyone starting out should need to know.

## Contributing
Before starting work you should hash it out with us over on [discord](https://discordapp.com/invite/4SkAduM) to make sure it is not already being worked on by someone else.

Check out our guidelines [here.](/CONTRIBUTING.md)

## Development
1. Clone this repository
2. Run `npm install`
3. Add your token and other options
4. Run `npm run dev`
