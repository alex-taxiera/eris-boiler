const Eris = require('eris')

// project modules
const { TOKEN } = require('./config.json')
const { common, database, commands, permissions } = require('./modules')

if (!TOKEN || TOKEN === '') common.log('no token', 'red')
let bot = new Eris(TOKEN)
bot.connect()

module.exports = bot

// events
bot.on('disconnect', () => {
  common.log('disconnected', 'red')
})

bot.on('error', (e) => {
  common.log('error', 'red', e)
})

bot.on('guildCreate', (guild) => {
  common.log(`joined ${guild.name} guild`, 'green')
  database.addClient(guild.id)
})

bot.on('guildDelete', (guild) => {
  let id = guild.id
  common.log(`left ${guild.name} guild`, 'yellow')
  database.removeClient(id)
})

bot.on('ready', () => {
  common.log('online', 'green')
  const { randomGames, defaultGame } = database.getSettings()
  if (randomGames) setInterval(() => common.setGame({ bot }), 43200000)
  else if (defaultGame) common.setGame({ name: defaultGame, bot })
  database.initialize(bot.guilds)
})

bot.on('messageCreate', async (msg) => {
  if (!msg.member || msg.member.id === bot.user.id) return
  const { prefix } = await database.getClient(msg.channel.guild.id)
  let params = msg.content.substring(prefix.length).split(' ')
  let command = commands[params.splice(0, 1)[0]]; if (!command) return

  msg.delete().catch((e) => common.log('cannot delete messages', 'yellow'))

  if (params.length < command.parameters.length) {
    return msg.channel.createMessage(msg.author.mention + ' insufficient parameters!')
    .then((m) => setTimeout(() => m.delete(), 10000))
  }

  let perm = permissions[command.permission]
  if (!await allow(perm, msg)) {
    return msg.channel.createMessage(msg.author.mention + ' ' + perm.deny())
    .then((m) => setTimeout(() => m.delete(), 10000))
  }

  if (command.name === 'help') params = commands
  command.run({ params, bot, msg })
  .then(({ content, embed, delay = 10000 }) => {
    if (!content) return
    if (embed) {
      content = msg.author.mention + ' ' + content
      return msg.channel.createMessage({ content, embed })
      .then((m) => { if (delay) setTimeout(() => m.delete(), delay) })
      .catch(console.error)
    }
    msg.channel.createMessage(msg.author.mention + ' ' + content)
    .then((m) => { if (delay) setTimeout(() => m.delete(), delay) })
    .catch(console.error)
  })
})

// helpers

async function allow (perm, msg) {
  let keys = Object.keys(permissions)
  for (let i = keys.indexOf(perm.name); i < keys.length; i++) {
    if (await permissions[keys[i]].check(msg.member)) return true
  }
  return false
}
