/**
 * @external {ExtendedUser} https://abal.moe/Eris/docs/ExtendedUser
 * @external {Message}      https://abal.moe/Eris/docs/Message
 */
/**
 * A class handling all message based communications.
 */
class Orator {
  constructor (Logger, options = {}) {
    this._logger = new Logger()
    this._analytics = options.analytics || false
    this._analyticsFile = '../commands.log.json'
  }
  /**
   * Process a message read by the bot.
   * @param {DataClient} bot The bot object.
   * @param {Message}    msg The message to process.
   */
  async processMessage (bot, msg) {
    this._start = Date.now() // NOTE: save in case of analytics
    if (!this._isGuild(msg)) return
    const { prefix } = await bot.dbm.getSettings(msg.channel.guild.id)
    if (!this._isCommandByUser(bot.user, msg, prefix)) return

    const params = msg.content.substring(prefix.length).split(' ')
    const cmd = params.splice(0, 1)[0]

    const command = this._getCommand(bot, cmd); if (!command) return

    const perm = bot.permissions.get(command.permission)
    this._canExecute(bot, command, params, perm, msg)
      .then((can) => this._execute(command, bot, msg, params))
      .catch((error) => this._badCommand(msg, error.message))
  }
  /**
   * Create and delete a response message based on a bad command invocation.
   * @private
   * @param   {Message} msg   The message that was a bad command invocation.
   * @param   {String}  issue A message describing the issue with the command.
   * @param   {Number}  delay How many ms to wait before deleting the response.
   */
  _badCommand (msg, issue) {
    msg.channel.createMessage(`${msg.author.mention} ${issue}`)
      .then((m) => setTimeout(() => m.delete(), 20000))
  }
  /**
   * Whether a member can execute a command.
   * @private
   * @param   {DataClient}       bot     The bot object.
   * @param   {Command}          command The command to check execution.
   * @param   {String[]}         params  The params sent by the user.
   * @param   {Permission}       perm    The permission data for the command.
   * @param   {Message}          msg     The message invoking the command.
   * @return  {Promise<Boolean>}         Resolves true or will reject.
   */
  async _canExecute (bot, command, params, perm, msg) {
    if (params.length < command.parameters.length) throw Error('insufficient parameters!')
    if (!bot.memberCan(msg.member, perm)) throw Error(perm.deny)
    return true
  }
  /**
   * Execute a command.
   * @private
   * @param   {Command}    command The command to execute.
   * @param   {DataClient} bot     The bot object.
   * @param   {Message}    msg     The message that invoked the command.
   * @param   {String[]}   params  The parameters specified in the message.
   */
  _execute (command, bot, msg, params) {
    const {
      name,
      run,
      deleteInvoking,
      deleteResponse,
      deleteResponseDelay
    } = command

    run({ bot, msg, params }).then(async (response) => {
      if (deleteInvoking) msg.delete().catch((e) => bot.logger.warn('cannot delete messages'))
      if (!response) return
      if (this._analytics) this._speedLog(name)
      const { content, file } = this._parseResponse(response)
      msg.channel.createMessage(content, file)
        .then((m) => {
          if (deleteResponse) setTimeout(() => m.delete(), deleteResponseDelay)
        })
        .catch(bot.logger.error)
    })
  }
  /**
   * Get a command based on a string query.
   * @private
   * @param   {DataClient}          bot     The bot object.
   * @param   {String}              command The string to look for in the data stores.
   * @return  {(Command|undefined)}
   */
  _getCommand (bot, command) {
    return bot.commands.get(command) || bot.commands.get(bot.aliases.get(command))
  }
  /**
   * Check a message to see if it invokes a command.
   * @private
   * @param   {ExtendedUser} me     The bot user.
   * @param   {Message}      msg    The message to check for a command.
   * @param   {String}       prefix The designated command prefix for the given guild.
   * @return  {Boolean}             Whether or not this message is invoking a command.
   */
  _isCommandByUser (me, msg, prefix) {
    return msg.content.startsWith(prefix) && msg.member.id !== me.id
  }
  /**
   * Check if a message was sent in a guild.
   * @private
   * @param   {Message} msg The message to check.
   * @return  {Boolean}     Whether or not the message was sent in a guild.
   */
  _isGuild (msg) {
    return msg.channel.guild
  }
  /**
   * Parse the response from a command.
   * @param    {(Object|String)}    response                The return value of the command.
   * @return   {Object}                                     The message data.
   * @property {Object}             message.content         The content to pass createMessage.
   * @property {String}             message.content.content The string content of the response.
   * @property {(Object|undefined)} message.content.embed   The embed object of the response.
   * @property {(Object|undefined)} message.file            The file object to pass createMessage.
   */
  _parseResponse (response) {
    return {
      content: {
        content: typeof response === 'string' ? response : response.content || '',
        embed: response.embed
      },
      file: response.file
    }
  }
  /**
   * Log speed of command execution to file.
   * @param {String} name The name of the command that was executed.
   */
  async _speedLog (name) {
    const { writeFile, readFile } = require('fs').promises
    const time = Date.now() - this._start
    this._logger.log(`${time}ms | ${name}`)
    const fd = await readFile(this._analyticsFile)
      .catch((e) => writeFile(this._analyticsFile, '{}')
        .then(() => readFile(this._analyticsFile)))
    const logs = JSON.parse(fd)
    if (logs[name]) {
      logs[name].count++
      logs[name].ms += time
      logs[name].avg = logs[name].ms / logs[name].count
    } else {
      logs[name] = { count: 1, ms: time, avg: time }
    }
    writeFile(this._analyticsFile, JSON.stringify(logs, undefined, 2))
      .catch(this._logger.error)
  }
}

module.exports = Orator
