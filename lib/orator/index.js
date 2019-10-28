const { logger, get } = require('../utils')

class Orator {
  /**
   * A class handling all message based communications.
   * @param {string}        defaultPrefix The default command prefix.
   * @param {OratorOptions} oratorOptions The OratorOptions.
   */
  constructor (defaultPrefix, options = {}) {
    const {
      deleteInvoking = false,
      deleteResponse = false,
      deleteResponseDelay = 10000
    } = options
    /**
     * @type {string}
     */
    this.defaultPrefix = options.defaultPrefix || defaultPrefix
    this.deleteInvoking = deleteInvoking
    this.deleteResponse = deleteResponse
    this.deleteResponseDelay = deleteResponseDelay
  }

  set permissions (permissions) {
    if (permissions) {
      this._permissions = [ ...permissions.values() ]
        .sort((a, b) => a.level - b.level)
    }
  }

  /**
   * @type {Array<Permission>}
   */
  get permissions () {
    return this._permissions
  }

  /**
   * Try to delete a message.
   * @param   {ExtendedUser}       me  The bot user.
   * @param   {Message}            msg The message to delete
   * @returns {Promise<void>|void}
   */
  tryMessageDelete (me, msg) {
    const permissions = msg.channel.permissionsOf(me.id)
    if (permissions.has('manageMessages') || msg.author.id === me.id) {
      return msg.delete()
        .catch((error) => {
          logger.error(`Failed to delete: ${error}`)
        })
    }
  }

  /**
   * Try to send a message.
   * @param   {ExtendedUser}       me      The bot user.
   * @param   {TextChannel}        channel The channel to send the message in.
   * @param   {string|any}         content The content of the message.
   * @param   {any}                file    The file to send (if any).
   * @returns {Promise<void>|void}
   */
  tryCreateMessage (me, channel, content, file) {
    const permissions = channel.permissionsOf(me.id)
    if (permissions.has('sendMessages')) {
      return channel.createMessage(content, file)
        .catch((error) => {
          logger.warn(`Failed to send: ${error}`)
        })
    }
  }

  /**
   * Try to send a message.
   * @param   {ExtendedUser}  me      The bot user.
   * @param   {Message}       msg     The message that prompted the DM.
   * @param   {string|any}    content The content of the message.
   * @param   {any}           file    The file to send (if any).
   * @returns {Promise<void>}
   */
  tryDMCreateMessage (me, msg, content, file) {
    return msg.author.getDMChannel()
      .then((dm) => dm.createMessage(content, file))
      .then(async (success) => 'DM sent.')
      .catch(async (error) => {
        logger.warn(`Could not open DM: ${error}`)
        return {
          content,
          file
        }
      })
      .then(
        (response) =>
          this.tryCreateMessage(
            me, msg.channel, response.content || response, response.file
          )
      )
  }

  /**
   * Process a message read by the bot.
   * @param {DataClient} bot The bot object.
   * @param {Message}    msg The message to process.
   */
  async processMessage (bot, msg) {
    // this._start = Date.now() // TODO: use a map of start times for async goodness.
    if (this._isBotMessage(bot.user, msg)) { // !this._isGuild(msg) ||
      return
    }

    const context = await this._parseParamsForCommand(
      this._cleanParams(msg.content),
      msg,
      bot
    )

    if (context) {
      return this._tryToExecute(context)
        .then((response) =>
          this._processCommandResponse(context, response)
            .catch((error) => {
              logger.error(`error processing command response: ${error}`)
            })
        )
        .catch((error) => {
          logger.error(`error processing message: ${error}`)
        })
    }
  }

  async _parseParamsForCommand (params, msg, bot) {
    const first = params.shift()
    let cmd
    if (first === bot.user.id && params.length > 0) {
      cmd = params.shift()
    } else if (first.startsWith(bot.user.id)) {
      cmd = first.substring(bot.user.id.length)
    }

    if (!cmd) {
      const dbGuild = await bot.dbm.newQuery('guild').get(msg.channel.guild.id)
      const prefix = dbGuild.get('prefix') || this.defaultPrefix

      if (params.length === 0 && first === bot.user.id) {
        this._sendHelp(prefix, msg, bot.user)
        return
      } else if (first === prefix) {
        cmd = params.shift()
      } else if (first.startsWith(prefix)) {
        cmd = first.substring(prefix.length)
      }
    }

    const context = bot.findCommand(cmd)
    if (context) {
      return { ...context, msg, params }
    }
  }

  _cleanParams (content) {
    return content.toLowerCase()
      .split(/\s+/)
      .map((param) =>
        param.replace(/<@[&|!]?([0-9]+)>/g, (match, capture) => capture)
      )
  }

  async _tryToExecute (context) {
    const {
      command,
      msg,
      params
    } = context

    if (params.length < command.parameters.length) {
      return this._badCommand(msg, 'insufficient parameters!')
    }

    const isPermitted = await this.hasPermission(context)

    if (!isPermitted) {
      return this._badCommand(
        msg,
        get(
          command,
          [ 'permission', 'reason' ],
          'You do not have the required permissions.'
        )
      )
    }

    for (const middleware of command.middleware) {
      await middleware.run(context)
    }

    const subContext = this._checkSubCommand(context)

    if (subContext) {
      return this._tryToExecute(subContext)
    }

    return command.run(context)
  }

  /**
   * Check if a command can be executed in the given context.
   * @param   {CommandContext}   context The CommandContext.
   * @returns {Promise<boolean>}
   */
  async hasPermission (context) {
    const {
      command
    } = context

    if (!command.permission) {
      return true
    }

    const criteria = [
      command.permission,
      ...this.permissions.filter(
        (permission) => permission.level > command.permission.level
      )
    ]

    for (const criterion of criteria) {
      if (await criterion.run(context)) {
        return true
      }
    }

    return false
  }

  _checkSubCommand (context) {
    const {
      params,
      bot,
      command: {
        subCommands: commands
      }
    } = context

    const subContext = bot.findCommand(params[0], { commands })
    if (subContext) {
      return { ...context, ...subContext, params: params.slice(1) }
    }
  }

  async _processCommandResponse (context, response) {
    const {
      bot,
      msg,
      command
    } = context
    // TODO: analytics
    // if (this._analytics) {
    //   this._speedLog(name)
    // }
    if (response) {
      const content = {
        content: typeof response === 'string'
          ? response
          : response.content || '',
        embed: response.embed
      }

      const newMessage = await (
        response.dm
          ? this.tryDMCreateMessage(bot.user, msg, content, response.file)
          : this.tryCreateMessage(bot.user, msg.channel, content, response.file)
      )
      const shouldDeleteResponse = command.deleteResponse != null
        ? command.deleteResponse
        : this.deleteResponse
      if (newMessage && shouldDeleteResponse && !response.badCommand) {
        setTimeout(
          () => this.tryMessageDelete(bot.user, newMessage),
          command.deleteResponseDelay != null
            ? command.deleteResponseDelay
            : this.deleteResponseDelay
        )
      }
    }
    const shouldDeleteInvoking = command.deleteInvoking != null
      ? command.deleteInvoking
      : this.deleteInvoking
    if (shouldDeleteInvoking) {
      this.tryMessageDelete(bot.user, msg)
    }
  }

  /**
   * Create and delete a response message based on a bad command invocation.
   * @private
   * @param   {Message} msg   The message that was a bad command invocation.
   * @param   {String}  issue A message describing the issue with the command.
   * @param   {Number}  delay How many ms to wait before deleting the response.
   */
  async _badCommand (msg, issue) {
    return {
      content: `${msg.author.mention} ${issue}`,
      badCommand: true
    }
  }

  /**
   * Check a message to see if it invokes a command.
   * @private
   * @param   {ExtendedUser} me     The bot user.
   * @param   {Message}      msg    The message to check for a command.
   * @param   {String}       prefix The designated command prefix for the given guild.
   * @return  {Boolean}             Whether or not this message is invoking a command.
   */
  _isBotMessage (me, msg) {
    return msg.author.id === me.id || msg.author.bot
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
  _sendHelp (prefix, msg, me) {
    return this.tryCreateMessage(
      me,
      msg.channel,
      `Hello! The prefix is \`${prefix}\`, try \`${prefix}help\``
    )
  }
}

/**
 * @typedef  OratorOptions
 * @property {string}  [defaultPrefix]             The default command prefix.
 * @property {boolean} [deleteInvoking=false]      Default behavior for whether or not the bot should delete the message that invoked a command.
 * @property {boolean} [deleteResponse=false]      Default behavior for whether or not the bot should delete the message response from a command.
 * @property {number}  [deleteResponseDelay=10000] Default behavior for how many miliseconds to wait before deleting the bots response from a command.
 */

module.exports = Orator
