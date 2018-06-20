module.exports = async (bot, msg) => {
  if (!msg.member || msg.member.id === bot.user.id) return
  const { prefix } = await bot.dbm.getSettings(msg.channel.guild.id)
  if (!msg.content.startsWith(prefix)) return

  const params = msg.content.substring(prefix.length).split(' ')
  const cmd = params.splice(0, 1)[0]

  const command = bot.getCommand(cmd); if (!command) return
  const {
    name,
    parameters,
    permission,
    run,
    deleteInvoking,
    deleteResponse,
    deleteResponseDelay
  } = command

  if (params.length < parameters.length) {
    return msg.channel.createMessage(`${msg.author.mention} insufficient parameters!`)
      .then((m) => setTimeout(() => m.delete(), 15000))
  }

  const perm = bot.permissions.get(permission)
  if (!bot.memberCan(msg.member, perm)) {
    return msg.channel.createMessage(`${msg.author.mention} ${perm.deny}`)
      .then((m) => setTimeout(() => m.delete(), 25000))
  }
  run({ params, bot, msg }).then(async (response) => {
    if (deleteInvoking) msg.delete().catch((e) => bot.logger.warn('cannot delete messages'))
    if (!response) return
    const content = parseResponse(response)
    return msg.channel.createMessage(content)
      .then((m) => {
        if (deleteResponse) setTimeout(() => m.delete(), deleteResponseDelay)
      })
      .catch(bot.logger.error)
  })
}

/**
 * Parse the response from a command.
 * @param    {(Object|String)}  response        The return value of the command.
 * @return   {Object}                           A properly formatted response.
 * @property {Number}           delay           The amount of time to wait before deleting the response.
 * @property {Object}           content         The content to pass createMessage
 * @property {String}           content.content The string content of the response.
 * @property {Object|undefined} content.embed   The embed object of the response.
 */
function parseResponse (response) {
  const content = {
    content: response.content || '',
    embed: response.embed || undefined
  }
  if (typeof response === 'string') content.content = response
  return content
}
