const { logger } = require('../utils')

/**
 * A class handling all message based communications.
 */
class Orator {
  /**
   * Create an Orator.
   * @param {string}        defaultPrefix The default command prefix.
   * @param {OratorOptions} oratorOptions
   */
  // {
  //   // analytics = false,
  //   // analyticsFilePath = './commands.log.json'
  // } = {}
  constructor (defaultPrefix, oratorOptions) {
    if (!oratorOptions) {
      oratorOptions = {
        embed: null
        // analytics: false,
        // analyticsFilePath: './commands.log.json'
      }
    }

    /**
     * @type {string}
     */
    this.defaultPrefix = defaultPrefix

    /**
     * @type {Embed}
     */
    this.defaultEmbed = oratorOptions.embed

    // /**
    //  * @type {boolean}
    //  */
    // this._analytics = analytics
    // /**
    //  * @type {string}
    //  */
    // this._analyticsFile = analyticsFilePath
  }

  tryMessageDelete (me, msg) {
    const permissions = msg.channel.permissionsOf(me.id)
    if (permissions.has('manageMessages') || msg.author.id === me.id) {
      return msg.delete()
        .catch((error) => logger.error(`Failed to delete: ${error}`))
    }
  }

  tryCreateMessage (me, channel, content, file) {
    const permissions = channel.permissionsOf(me.id)
    if (permissions.has('sendMessages')) {
      return channel.createMessage(content, file)
        .catch((error) => logger.warn(`Failed to send: ${error}`))
    }
  }

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
      this._tryToExecute(context)
        .then((response) =>
          this._processCommandResponse(context, response)
            .catch((error) =>
              logger.error(`error processing command response: ${error}`)
            )
        )
        .catch((error) => logger.error(`error processing message: ${error}`))
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
      return Object.assign({ msg, params }, context)
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

    for (const middleware of command.middleware) {
      if (!middleware.run(context)) {
        return this._badCommand(msg, middleware.reason)
      }
    }

    const subContext = this._checkSubCommand(context)

    if (subContext) {
      return this._tryToExecute(subContext)
    }

    return command.run(context)
  }

  _checkSubCommand (context) {
    const {
      msg,
      params,
      bot,
      command: {
        subCommands: commands,
        subAliases: aliases
      }
    } = context

    const subContext = bot.findCommand(params[0], { commands, aliases })
    if (subContext) {
      return Object.assign(subContext, { msg, params: params.slice(1) })
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
        embed: Object.assign({}, this.defaultEmbed, response.embed)
      }

      const newMessage = await (
        response.dm
          ? this.tryDMCreateMessage(bot.user, msg, content, response.file)
          : this.tryCreateMessage(bot.user, msg.channel, content, response.file)
      )

      if (newMessage && command.deleteResponse && !response.badCommand) {
        setTimeout(
          () => this.tryMessageDelete(bot.user, newMessage),
          command.deleteResponseDelay
        )
      }
    }

    if (command.deleteInvoking) {
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
    return msg.member.id === me.id || msg.author.bot
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

  /**
   * Log speed of command execution to file.
   * @private
   * @param   {String} name The name of the command that was executed.
   */
  // TODO: real command timing.
  // async _speedLog (name) {
  //   const { writeFile, readFile } = require('fs').promises
  //   const time = Date.now() - this._start
  //   this._logger.info(`${time}ms | ${name}`)
  //   const logs = JSON.parse(
  //     await readFile(this._analyticsFile)
  //       .catch((e) => writeFile(this._analyticsFile, '{}')
  //         .then(() => readFile(this._analyticsFile)))
  //   )
  //   if (logs[name]) {
  //     logs[name].count++
  //     logs[name].ms += time
  //     logs[name].avg = logs[name].ms / logs[name].count
  //   } else {
  //     logs[name] = { count: 1, ms: time, avg: time }
  //   }
  //   writeFile(this._analyticsFile, JSON.stringify(logs, undefined, 2))
  //     .catch(this._logger.error)
  // }
}

/**
 * @typedef {object} Field
 * @property {string} [name] Field's name
 * @property {string} [value] Field's value
 */

/**
 * @typedef {object} Footer
 * @property {string} [text] Footer's text
 * @property {string} [icon_url] Footer's icon_url
 */

/**
 * @typedef {object} Author
 * @property {string} [name] Author's name
 * @property {string} [icon_url] Author's icon_url
 */

/**
 * @typedef {object} Embed
 * @property {string} [title] Embed's title,
 * @property {string} [description] Embed's description
 * @property {string} [url] Embed's URL
 * @property {Number} [color] Embed's color
 * @property {Number|Date} [timestamp] Emebed's timestamp
 * @property {Author} [author] Embed's author
 * @property {Footer} [footer] Embed's footer
 * @property {Array<Field>} [fields] Embed's fields
 */

/**
 * @typedef  {object}  OratorOptions
 * @property {boolean} [analytics=false]   If enabled, command execution is timed.
 * @property {string}  [analyticsFilePath] Where to save the analytics log, defaults to root.
 * @property {Embed} [embed] Default embed fields
 */

module.exports = Orator
