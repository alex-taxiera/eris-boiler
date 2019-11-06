const {
  ExtendedMap
} = require('../utils')

class Command {
  /**
   * Class representing a command.
   * @param {CommandData} data The CommandData.
   */
  constructor ({
    name,
    description,
    run,
    options: {
      aliases = [],
      parameters = [],
      middleware = [],
      deleteInvoking,
      deleteResponse,
      deleteResponseDelay,
      subCommands = [],
      permission
    } = {}
  }) {
    /**
     * @type {string}
     */
    this.name = name
    /**
     * @type {string}
     */
    this.description = description
    /**
     * @type {CommandAction}
     */
    this.run = run
    /**
     * @type {string[]}
     */
    this.aliases = aliases
    /**
     * @type {string[]}
     */
    this.parameters = parameters
    /**
     * @type {CommandMiddleware[]}
     */
    this.middleware = middleware
    /**
     * @type {boolean}
     */
    this.deleteInvoking = deleteInvoking
    /**
     * @type {boolean}
     */
    this.deleteResponse = deleteResponse
    /**
     * @type {number}
     */
    this.deleteResponseDelay = deleteResponseDelay
    /**
     * @type {Permission}
     */
    this.permission = permission
    /**
     * @type {ExtendedMap<string, Command>}
     */
    this.subCommands = new ExtendedMap()

    for (const sub of subCommands) {
      if (!(sub instanceof Command)) {
        throw new TypeError('INVALID_COMMAND')
      }
      this.subCommands.set(sub.name, sub)
    }
  }

  /**
   * @type {string}
   */
  get info () {
    return `Name: ${this.name}\n` + (
      this.aliases[0]
        ? 'Aliases: ' + this.aliases.join(', ') + '\n'
        : ''
    ) + 'Description: ' + this.description + (
      this.parameters[0]
        ? '\nParameters: ' + this.parameters.join(', ')
        : ''
    ) + (
      this.subCommands.size > 0
        ? '\n\nSub Commands\n' +
          this.subCommands.map((command) => command.info).join('\n\n')
        : ''
    )
  }
}

module.exports = Command

/**
 * @typedef  CommandData
 * @property {string}         name        The command name.
 * @property {string}         description The command description.
 * @property {CommandAction}  run         The command function.
 * @property {CommandOptions} [options]   The command options.
 */

/**
 * @typedef  CommandOptions
 * @property {string[]}   [aliases=[]]                List of alias names for the command.
 * @property {string[]}   [parameters=[]]             List of paremeters that the command takes.
 * @property {Permission} [permission]                The permission threshold needed to execute this command.
 * @property {boolean}    [deleteInvoking=true]       Whether or not the bot should delete the message that invoked this command.
 * @property {boolean}    [deleteResponse=true]       Whether or not the bot should delete the message response from this command.
 * @property {number}     [deleteResponseDelay=10000] How many miliseconds to wait before deleting the bots response.
 */

/**
 * @callback CommandAction
 * @param    {CommandContext}        context The CommandContext.
 * @returns  {CommandResults|string}
 */

/**
 * @typedef  CommandContext
 * @property {string[]}   params The parsed params that make up the invoking message.
 * @property {Message}    msg    The message from Discord {@link https://abal.moe/Eris/docs/Message|(link)}.
 * @property {DataClient} bot    The bot client.
 */

/**
 * @typedef  CommandResults
 * @property {string} content The message content.
 */
