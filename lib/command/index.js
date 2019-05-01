/**
 * Class representing a command.
 */
class Command {
  /**
   * Create a command.
   * @param {CommandData} data The CommandData.
   */
  constructor ({
    name,
    description,
    run,
    options: {
      aliases = [],
      parameters = [],
      permission = 0,
      deleteInvoking = true,
      deleteResponse = true,
      deleteResponseDelay = 10000,
      subCommands = []
    } = {}
  }) {
    /**
     * @type {string} The command name.
     */
    this.name = name
    /**
     * @type {string} The command description.
     */
    this.description = description
    /**
     * @type {CommandAction} The command function.
     */
    this.run = run
    /**
     * @type {string[]} List of alias names for the command.
     */
    this.aliases = aliases
    /**
     * @type {string[]} List of paremeters that the command takes.
     */
    this.parameters = parameters
    /**
     * @type {number} The permission level required to use the command.
     */
    this.permission = permission
    /**
     * @type {boolean} Whether or not the bot should delete the message that invoked this command.
     */
    this.deleteInvoking = deleteInvoking
    /**
     * @type {boolean} Whether or not the bot should delete the bots response.
     */
    this.deleteResponse = deleteResponse
    /**
     * @type {number} How many miliseconds to wait before deleting the bots response.
     */
    this.deleteResponseDelay = deleteResponseDelay
    /**
     * @type {Command[]} Sub Commands.
     */
    this.subCommands = new Map()
    this.subAliases = new Map()

    for (const sub of subCommands) {
      this.subCommands.set(sub.name, sub)
      for (const alias of sub.aliases) {
        this.subAliases.set(alias, sub)
      }
    }
  }

  /**
   * Get information about the command.
   * @return {string} Info string containing name and description.
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
      this.subCommands[0]
        ? '\n\nSub Commands\n' +
          this.subCommands.map((command) => command.info).join('\n\n')
        : ''
    )
  }
}

/**
 * @typedef  {object}         CommandData The command data.
 * @property {string}         name        The command name.
 * @property {string}         description The command description.
 * @property {CommandAction}  run         The command function.
 * @property {CommandOptions} [options]   The command options.
 */

/**
 * @typedef  {object}   CommandOptions
 * @property {string[]} [aliases=[]]                List of alias names for the command.
 * @property {string[]} [parameters=[]]             List of paremeters that the command takes.
 * @property {string}   [permission='Anyone']       The name of the permission required to use the command.
 * @property {boolean}  [deleteInvoking=true]       Whether or not the bot should delete the message that invoked this command.
 * @property {boolean}  [deleteResponse=true]       Whether or not the bot should delete the message that invoked this command.
 * @property {number}   [deleteResponseDelay=10000] How many miliseconds to wait before deleting the bots response.
 */

/**
 * @typedef {function(CommandContext): (CommandResults|string)} CommandAction
 */

/**
 * @typedef  {object} CommandContext
 * @property {string[]}   params The parsed params that make up the invoking message.
 * @property {Message}    msg    The message from Discord.
 * @property {DataClient} bot    The bot client.
 */

/**
 * @typedef  {object} CommandResults
 * @property {string} content The message content.
 */

module.exports = Command
