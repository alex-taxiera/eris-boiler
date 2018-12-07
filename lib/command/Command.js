/**
 * Class representing a command.
 * @extends {SafeClass}
 */
class Command extends require('../safe-class') {
  /**
   * Create a command.
   * @param {DataClient} bot                                      The bot object.
   * @param {Object}     data                                     The command data.
   * @param {String}     data.name                                The command name.
   * @param {String}     data.description                         The command description.
   * @param {Function}   data.run                                 The command function.
   * @param {Object}     data.options                             The command options.
   * @param {String[]}   [data.options.aliases=[]]                List of alias names for the command.
   * @param {String[]}   [data.options.parameters=[]]             List of paremeters that the command takes.
   * @param {String}     [data.options.permission='Anyone']       The name of the permission required to use the command.
   * @param {Boolean}    [data.options.deleteInvoking=true]       Whether or not the bot should delete the message that invoked this command.
   * @param {Boolean}    [data.options.deleteResponse=true]       Whether or not the bot should delete the message that invoked this command.
   * @param {Number}     [data.options.deleteResponseDelay=10000] How many miliseconds to wait before deleting the bots response.
   */
  constructor (bot, data) {
    super({
      name: 'string',
      description: 'string',
      run: 'function',
      aliases: 'string[]',
      parameters: 'string[]',
      permission: 'string',
      deleteInvoking: 'boolean',
      deleteResponse: 'boolean',
      deleteResponseDelay: 'number'
    }, {
      permission: Array.from(bot.permissions.keys())
    })
    const { options = {} } = data

    /**
     * The command name.
     * @type {String}
     */
    this.name = data.name
    /**
     * The command description.
     * @type {String}
     */
    this.description = data.description
    /**
     * The command function.
     * @type {Function}
     */
    this.run = data.run
    /**
     * List of alias names for the command.
     * @type {String[]}
     */
    this.aliases = options.aliases || []
    /**
     * List of paremeters that the command takes.
     * @type {String[]}
     */
    this.parameters = options.parameters || []
    /**
     * The name of the permission required to use the command.
     * @type {String}
     */
    this.permission = options.permission || 'Anyone'
    /**
     * Whether or not the bot should delete the message that invoked this command.
     * @type {Boolean}
     */
    this.deleteInvoking = options.deleteInvoking !== undefined ? options.deleteInvoking : true
    /**
     * Whether or not the bot should delete the bots response.
     * @type {Boolean}
     */
    this.deleteResponse = options.deleteResponse !== undefined ? options.deleteResponse : true
    /**
     * How many miliseconds to wait before deleting the bots response.
     * @type {Number}
     */
    this.deleteResponseDelay = options.deleteResponseDelay || 10000

    /**
     * Sub Commands
     * @type {Command[]}
     */
    this.subCommands = options.subCommands || []

    // verify types of properties match those defined in mandatoryTypes
    this._checkDataTypes()
  }
  /**
   * Get information about the command.
   * @return {String} Info string containing name and description.
   */
  get info () {
    let str = `Name: ${this.name}\n`
    if (this.aliases[0]) str += `Aliases: ${this.aliases.join(', ')}\n`
    str += `Description: ${this.description}`
    if (this.parameters[0]) str += `\nParameters:${this.parameters.join(', ')}`
    return str
  }
}

module.exports = Command
