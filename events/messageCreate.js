module.exports = async (bot, msg) => {
  if (!msg.member || msg.member.id === bot.user.id) return

  const { prefix } = await bot.dbm.getClient(msg.channel.guild.id)
  if (!msg.content.startsWith(prefix)) return

  const params = msg.content.substring(prefix.length).split(' ')
  const cmd = params.splice(0, 1)[0]
  const command = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd))
  if (!command) return

  msg.delete()
  .catch((e) => bot.logger.warn('cannot delete messages'))

  if (params.length < command.parameters.length) {
    return msg.channel.createMessage(msg.author.mention + ' insufficient parameters!')
    .then((m) => setTimeout(() => m.delete(), 15000))
  }

  const perm = bot.permissions.get(command.permission)
  if (!await allow(bot, perm, msg)) {
    return msg.channel.createMessage(msg.author.mention + ' ' + perm.deny())
    .then((m) => setTimeout(() => m.delete(), 25000))
  }
  command.run({ params, bot, msg })
  .then((response) => {
    if (!response) return
    const { message, delay } = parseResponse(response)
    return msg.channel.createMessage(message)
    .then((m) => { if (delay) setTimeout(() => m.delete(), delay) })
    .catch(console.error)
  })
}

/**
 * Determine whether a user is allowed to use a command.
 * @return {Boolean} Whether the user is allowed.
 */
async function allow (bot, perm, msg) {
  for (let [key, val] of bot.permissions) {
    if (val.level < perm.level) continue
    if (await val.check(msg.member, bot)) return true
  }
  return false
}

/**
 * Parse the response from a command.
 * @param  {(Object|String)} message The return value of the command.
 * @return {Object}                  A properly formatted response.
 */
function parseResponse (message) {
  let delay = message.delay || 10000
  if (typeof message === 'object') {
    const { content, embed } = message
    if (embed) {
      message = { content, embed }
    } else {
      message = content
    }
  }
  return { message, delay }
}
