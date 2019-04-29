const { logger } = require('../utils')

/**
 * A class handling all message based communications.
 */
class Orator {
  /**
   * Create an Orator.
   * @param {OratorOptions} oratorOptions
   */
  constructor ({
    defaultPrefix,
    analytics = false,
    analyticsFilePath = './commands.log.json'
  } = {}) {
    /**
     * @type {string}
     */
    this.defaultPrefix = defaultPrefix
    /**
     * @type {boolean}
     */
    this._analytics = analytics
    /**
     * @type {string}
     */
    this._analyticsFile = analyticsFilePath
  }

  /**
   * Process a message read by the bot.
   * @param {DataClient} bot The bot object.
   * @param {Message}    msg The message to process.
   */
  async processMessage (bot, msg) {
    this._start = Date.now() // NOTE: save in case of analytics
    if (!this._isGuild(msg)) {
      return
    }
    const dbGuild = await bot.dbm.newQuery('guild').get(msg.channel.guild.id)
    const prefix = dbGuild.get('prefix') || this.defaultPrefix

    if (this._isMentioned(bot.user, msg)) {
      return this._sendHelp(prefix, msg)
    }

    if (this._isCommandByUser(bot.user, msg, prefix)) {
      const params = msg.content
        .substring(prefix.length)
        .split(/\s+/).map((param) => {
          const mentionMatch = param.match(/(?<=<@[&|!]?)[0-9]+(?=>)/)
          return mentionMatch ? mentionMatch[0] : param
        })
      const command = bot.findCommand(params.shift())
      if (command) {
        const permission = bot.permissions.find((perm) => perm.level === command.permission)
        const context = {
          bot,
          msg,
          params
        }

        this._tryToExecute(command, context, permission)
      }
    }
  }

  async _tryToExecute (command, context, permission) {
    const {
      bot,
      msg,
      params
    } = context

    if (params.length < command.parameters.length) {
      return this._badCommand(msg, 'insufficient parameters!')
    }

    if (await bot.permissionLevel(msg.member) < command.permission) {
      return this._badCommand(msg, permission.deny)
    }

    this._execute(command, context).catch(logger.error)
  }

  /**
   * Execute a command.
   * @private
   * @param   {Command}    command The command to execute.
   * @param   {DataClient} bot     The bot object.
   * @param   {Message}    msg     The message that invoked the command.
   * @param   {String[]}   params  The parameters specified in the message.
   */
  async _execute (command, context) {
    const {
      subCommands,
      run
    } = command
    const {
      bot,
      msg,
      params
    } = context

    if (subCommands.length > 0) {
      const cmd = params[0]
      const sub = subCommands.find(
        (command) => command.name === cmd || command.aliases.includes(cmd)
      )
      if (sub) {
        params.shift()
        const permission = bot.permissions.find((perm) => perm.level === sub.permission)
        return this._tryToExecute(sub, context, permission)
      }
    }

    const response = await run({ bot, msg, params })
    this._processCommandResponse(command, context, response)
  }

  async _processCommandResponse (command, context, response) {
    const {
      name,
      deleteInvoking,
      deleteResponse,
      deleteResponseDelay
    } = command
    const {
      msg
    } = context

    if (this._analytics) {
      this._speedLog(name)
    }
    if (deleteInvoking) {
      msg.delete().catch((e) => logger.warn('cannot delete messages'))
    }
    if (!response) {
      return
    }

    const content = {
      content: typeof response === 'string' ? response : response.content || '',
      embed: response.embed
    }
    try {
      const newMessage = await msg.channel.createMessage(content, response.file)
      if (deleteResponse) {
        setTimeout(
          () => newMessage.delete().catch(logger.error),
          deleteResponseDelay
        )
      }
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * Create and delete a response message based on a bad command invocation.
   * @private
   * @param   {Message} msg   The message that was a bad command invocation.
   * @param   {String}  issue A message describing the issue with the command.
   * @param   {Number}  delay How many ms to wait before deleting the response.
   */
  _badCommand (msg, issue, delay = 20000) {
    return new Promise((resolve, reject) => {
      msg.channel.createMessage(`${msg.author.mention} ${issue}`)
        .then(
          (m) => setTimeout(
            () => m.delete().then(resolve).catch(reject),
            delay
          )
        )
        .catch(reject)
    })
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
    return msg.content.startsWith(prefix) &&
      msg.member.id !== me.id &&
      !msg.author.bot
  }

  /**
   * Check a message to see if it mentions the bot.
   * @private
   * @param  {ExtendedUser} me  The bot user.
   * @param  {Message}      msg The message to check for mention.
   * @return {Boolean}          Whether or not this message mentions the bot.
   */
  _isMentioned (me, msg) {
    return msg.mentions.some((user) => user.id === me.id)
  }

  /**
   * Check if a message was sent in a guild.
   * @private
   * @param   {Message} msg The message to check.
   * @return  {Boolean}     Whether or not the message was sent in a guild.
   */
  _isGuild (msg) {
    return !!msg.channel.guild
  }

  /**
   * Send a help message in chat.
   * @param {String}  prefix The prefix used in the server the message was sent.
   * @param {Message} msg    The message needing help.
   */
  _sendHelp (prefix, msg) {
    return msg.channel.createMessage(
      `Hello! The prefix is \`${prefix}\`, try \`${prefix}help\``
    )
  }

  /**
   * Log speed of command execution to file.
   * @private
   * @param   {String} name The name of the command that was executed.
   */
  async _speedLog (name) {
    const { writeFile, readFile } = require('fs').promises
    const time = Date.now() - this._start
    this._logger.log(`${time}ms | ${name}`)
    const logs = JSON.parse(
      await readFile(this._analyticsFile)
        .catch((e) => writeFile(this._analyticsFile, '{}')
          .then(() => readFile(this._analyticsFile)))
    )
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

/**
 * @typedef  {object}  OratorOptions
 * @property {string}  defaultPrefix       Default command prefix.
 * @property {boolean} [analytics=false]   If enabled, command execution is timed.
 * @property {string}  [analyticsFilePath] Where to save the analytics log, defaults to root.
 */

module.exports = Orator
