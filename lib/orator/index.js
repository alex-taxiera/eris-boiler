const { logger, get } = require('../../util')

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
    this._requiredSendPermissions = [ 'readMessages', 'sendMessages' ]
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
   * @param   {ExtendedUser}       me  The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
   * @param   {Message}            msg The message to delete {@link https://abal.moe/Eris/docs/Message|(link)}.
   * @returns {Promise<void>|void}
   */
  deleteMessage (me, msg) {
    const permissions = msg.channel.permissionsOf(me.id)
    if (permissions.has('manageMessages') || msg.author.id === me.id) {
      return msg.delete()
        .catch((error) => {
          logger.error(`Failed to delete: ${error}`)
        })
    }
  }

  replyToMessage (me, msg, content, file) {
    if (msg.channel.type === 1) {
      return this.createDirectMessage(me, msg, content, file)
    }

    return this.createMessage(me, msg.channel, content, file)
  }

  /**
   * Try to send a message.
   * @param   {ExtendedUser}               me      The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
   * @param   {TextChannel}                channel The channel to send the message in {@link https://abal.moe/Eris/docs/TextChannel|(link)}.
   * @param   {string|any}                 content The content of the message.
   * @param   {any}                        file    The file to send (if any).
   * @returns {Promise<Message|void>|void}
   */
  createMessage (me, channel, content, file) {
    const permissions = channel.permissionsOf(me.id)
    if (this._requiredSendPermissions.every((perm) => permissions.has(perm))) {
      return channel.createMessage(content, file)
        .catch((error) => {
          logger.warn(`Failed to send: ${error}`)
        })
    }
  }

  /**
   * Try to send a message.
   * @param   {ExtendedUser}  me      The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
   * @param   {Message}       msg     The message that prompted the DM {@link https://abal.moe/Eris/docs/Message|(link)}.
   * @param   {string|any}    content The content of the message.
   * @param   {any}           file    The file to send (if any).
   * @returns {Promise<Message | undefined>}
   */
  createDirectMessage (me, msg, content, file, notify = true) {
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
      .then((response) => {
        if (msg.channel.type === 0 && notify) {
          return this.createMessage(
            me, msg.channel, response.content || response, response.file
          )
        }
      })
  }

  /**
   * Process a message read by the bot.
   * @param {DataClient} bot The bot object.
   * @param {Message}    msg The message to process {@link https://abal.moe/Eris/docs/Message|(link)}.
   */
  async processMessage (bot, msg) {
    if (!msg.content || this._isBotMessage(bot.user, msg)) {
      return
    }

    const context = await this._parseParamsForCommand(
      this._cleanParams(msg.content),
      msg,
      bot
    )

    if (context) {
      return this._tryToExecute(bot, context)
        .then(({ context, response }) =>
          this._processCommandResponse(bot, context, response)
            .catch((error) => {
              logger.error(`error processing command response: ${error.stack}`)
            })
        )
        .catch((error) => {
          logger.error(`error processing message: ${error.stack}`)
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
      const dbGuild = msg.channel.guild
        ? await bot.dbm.newQuery('guild').get(msg.channel.guild.id)
        : undefined
      const prefix = (dbGuild && dbGuild.get('prefix')) || this.defaultPrefix

      if (params.length === 0 && first === bot.user.id) {
        this._sendHelp(prefix, msg, bot.user)
        return
      } else if (first === prefix) {
        cmd = params.shift()
      } else if (first.startsWith(prefix)) {
        cmd = first.substring(prefix.length)
      }
    }

    const command = bot.findCommand(cmd)
    if (command) {
      return { command, msg, params, channel: msg.channel }
    }
  }

  _cleanParams (content) {
    return [ ...content.matchAll(/(".+?"|'.+?')|[\S]+/g) ]
      .map(
        ([ match, group ]) => (group ? group.slice(1, -1) : match)
          .replace(/<[@|#][&|!]?([0-9]+)>/g, (match, capture) => capture)
          .replace(/[\uFE00-\uFE0F]/g, '')
      )
  }

  async _tryToExecute (bot, context) {
    const {
      command,
      params
    } = context

    if (params.length < command.parameters.length) {
      return this._badCommand(context, 'insufficient parameters!')
    }

    const permissionStatus = await this.hasPermission(bot, context)

    if (!permissionStatus.ok) {
      return this._badCommand(
        context,
        permissionStatus.message
      )
    }

    for (const middleware of command.middleware) {
      try {
        await middleware.run(bot, context)
      } catch (e) {
        logger.error('MIDDLEWARE ERROR:', e)
        return this._badCommand(
          context,
          middleware.failMessage || 'There was an error, report this!'
        )
      }
    }

    const subContext = this._checkSubCommand(bot, context)

    if (subContext) {
      return this._tryToExecute(bot, subContext)
    }

    let response
    try {
      response = await command.run(bot, context)
    } catch (error) {
      logger.error('Command error:', error)
      response =
        'There was an error processing your request, please try again later.'
    }

    return {
      context,
      response
    }
  }

  /**
   * Check if a command can be executed in the given context.
   * @param   {DataClient}       bot     The DataClient.
   * @param   {CommandContext}   context The CommandContext.
   * @returns {Promise<boolean>}
   */
  async hasPermission (bot, context) {
    const {
      command,
      msg
    } = context

    if (command.dmOnly) {
      if (msg.channel.guild) {
        return {
          ok: false,
          message: 'only allowed in a dm'
        }
      }
    } else if (command.guildOnly && !msg.channel.guild) {
      return {
        ok: false,
        message: 'only allowed in a guild'
      }
    }

    if (!command.permission) {
      return {
        ok: true,
        message: 'no permissions'
      }
    }

    const criteria = [
      command.permission,
      ...(this.permissions || []).filter(
        (permission) => permission.level > command.permission.level
      )
    ]

    for (const criterion of criteria) {
      if (await criterion.run(bot, context)) {
        return {
          ok: true,
          message: `user has permission level ${criterion.level}`
        }
      }
    }

    return {
      ok: false,
      message: get(
        command,
        [ 'permission', 'reason' ],
        'You do not have the required permissions.'
      )
    }
  }

  _checkSubCommand (bot, context) {
    const {
      params,
      command: {
        subCommands: commands
      }
    } = context

    const subCommand = bot.findCommand(params[0], commands)
    if (subCommand) {
      return { ...context, command: subCommand, params: params.slice(1) }
    }
  }

  async _processCommandResponse (bot, context, response) {
    const {
      msg,
      command
    } = context

    if (response) {
      const content = {
        content: typeof response === 'string'
          ? response
          : response.content || '',
        embed: response.embed
      }

      const newMessage = await (
        response.dm
          ? this.createDirectMessage(bot.user, msg, content, response.file)
          : this.replyToMessage(bot.user, msg, content, response.file)
      )

      if (command.postHook) {
        command.postHook(bot, context, newMessage)
      }

      const shouldDeleteResponse = command.deleteResponse != null
        ? command.deleteResponse
        : this.deleteResponse
      if (newMessage && shouldDeleteResponse && !response.badCommand) {
        setTimeout(
          () => this.deleteMessage(bot.user, newMessage),
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
      this.deleteMessage(bot.user, msg)
    }
  }

  /**
   * Create and delete a response message based on a bad command invocation.
   * @private
   * @param   {CommandContext} context The CommandContext.
   * @param   {string}         issue A message describing the issue with the command.
   */
  async _badCommand (context, issue) {
    return {
      context,
      response: {
        content: `${context.msg.author.mention} ${issue}`,
        badCommand: true,
        dm: context.msg.channel.type !== 0
      }
    }
  }

  /**
   * Check a message to see if it invokes a command.
   * @private
   * @param   {ExtendedUser} me     The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
   * @param   {Message}      msg    The message to check for a command {@link https://abal.moe/Eris/docs/Message|(link)}.
   * @param   {string}       prefix The designated command prefix for the given guild.
   * @return  {boolean}             Whether or not this message is invoking a command.
   */
  _isBotMessage (me, msg) {
    return msg.author.id === me.id || msg.author.bot
  }

  /**
   * Check a message to see if it mentions the bot.
   * @private
   * @param  {ExtendedUser} me  The bot user {@link https://abal.moe/Eris/docs/ExtendedUser|(link)}.
   * @param  {Message}      msg The message to check for mention {@link https://abal.moe/Eris/docs/Message|(link)}.
   * @return {boolean}          Whether or not this message mentions the bot.
   */
  _isMentioned (me, msg) {
    return msg.mentions.some((user) => user.id === me.id)
  }

  /**
   * Check if a message was sent in a guild.
   * @private
   * @param   {Message} msg The message to check {@link https://abal.moe/Eris/docs/Message|(link)}.
   * @return  {boolean}     Whether or not the message was sent in a guild.
   */
  _isGuild (msg) {
    return !!msg.channel.guild
  }

  /**
   * Send a help message in chat.
   * @private
   * @param   {string}  prefix The prefix used in the server the message was sent.
   * @param   {Message} msg    The message needing help {@link https://abal.moe/Eris/docs/Message|(link)}.
   */
  _sendHelp (prefix, msg, me) {
    return this.replyToMessage(
      me,
      msg,
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
