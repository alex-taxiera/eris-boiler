/**
 * Class representing a command.
 */
class Command {
  /**
   * Create a command.
   * @param {DataClient} bot                                      The bot object.
   * @param {Object}     data                                     The command data.
   * @param {String}     data.name                                The command name.
   * @param {String}     data.description                         The command description.
   * @param {Function}   data.run                                 The command function.
   * @param {Object}     [data.options={}]                        The command options.
   * @param {String[]}   [data.options.aliases=[]]                List of alias names for the command.
   * @param {String[]}   [data.options.parameters=[]]             List of paremeters that the command takes.
   * @param {String}     [data.options.permission='Anyone']       The name of the permission required to use the command.
   * @param {Boolean}    [data.options.deleteInvoking=true]       Whether or not the bot should delete the message that invoked this command.
   * @param {Boolean}    [data.options.deleteResponse=true]       Whether or not the bot should delete the message that invoked this command.
   * @param {Number}     [data.options.deleteResponseDelay=10000] How many miliseconds to wait before deleting the bots response.
   */
  constructor (bot, data) {
    const { name, description, run, options = {} } = data
    if (typeof name !== 'string') throw Error(`command cannot have name "${name}"`)
    if (typeof description !== 'string') throw Error(`command cannot have description "${description}"`)
    if (typeof run !== 'function') throw Error(`command cannot have run function "${run}"`)

    /**
     * The command name.
     * @type {String}
     */
    this.name = name
    /**
     * The command description.
     * @type {String}
     */
    this.description = description
    /**
     * The command function.
     * @type {Function}
     */
    this.run = run

    let aliases = false
    if (Array.isArray(options.aliases)) {
      aliases = true
      for (let i = 0; i < options.aliases.length; i++) {
        if (typeof options.aliases[i] !== 'string') aliases = false; break
      }
    }
    /**
     * List of alias names for the command.
     * @type {String[]}
     */
    this.aliases = aliases ? options.aliases : []
    /**
     * List of paremeters that the command takes.
     * @type {String[]}
     */
    let parameters = false
    if (Array.isArray(options.parameters)) {
      parameters = true
      for (let i = 0; i < options.parameters.length; i++) {
        if (typeof options.parameters[i] !== 'string') parameters = false; break
      }
    }
    this.parameters = parameters ? options.parameters : []
    /**
     * The name of the permission required to use the command.
     * @type {String}
     */
    this.permission = bot.permissions.get(options.permission) ? options.permission : 'Anyone'
    /**
     * Whether or not the bot should delete the message that invoked this command.
     * @type {Boolean}
     */
    this.deleteInvoking = typeof options.deleteInvoking === 'boolean' ? options.deleteInvoking : true
    /**
     * Whether or not the bot should delete the bots response.
     * @type {Boolean}
     */
    this.deleteResponse = typeof options.deleteResponse === 'boolean' ? options.deleteResponse : true
    /**
     * How many miliseconds to wait before deleting the bots response.
     * @type {Number}
     */
    this.deleteResponseDelay = typeof options.deleteResponseDelay === 'number' ? options.deleteResponseDelay : 10000
  }
  /**
   * Get information about the command.
   * @return {String} Info string containing name and description.
   */
  help () {
    let str = `Name: ${this.name}\n`
    if (this.aliases[0]) str += `Aliases: ${this.aliases.join(', ')}\n`
    str += `Description: ${this.description}`
    if (this.parameters[0]) str += `\nParameters:${this.parameters.join(', ')}`
    return str
  }
}

module.exports = Command
