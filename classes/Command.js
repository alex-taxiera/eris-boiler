/**
 * Class representing a command.
 */
class Command {
  /**
   * Create a command.
   * @param {Object}   data                       The command data.
   * @param {String}   data.name                  The command name.
   * @param {String[]} [data.aliases=[]]          List of alias names for the command.
   * @param {String}   data.description           The command description.
   * @param {String[]} [data.parameters=[]]       List of paremeters that the command takes.
   * @param {String}   [data.permission='Anyone'] The name of the permission required to use the command.
   * @param {Function} data.run                   The command function.
   */
  constructor ({ name, aliases, description, parameters, permission, run }) {
    if (typeof name !== 'string') throw Error(`command cannot have name "${name}"`)
    if (typeof description !== 'string') throw Error(`command cannot have description "${description}"`)
    if (typeof run !== 'function') throw Error(`command cannot have run function "${run}"`)

    /**
     * The command name.
     * @type {String}
     */
    this.name = name
    /**
     * List of alias names for the command.
     * @type {String[]}
     */
    this.aliases = aliases || []
    /**
     * The command description.
     * @type {String}
     */
    this.description = description
    /**
     * List of paremeters that the command takes.
     * @type {String[]}
     */
    this.parameters = parameters || []
    /**
     * The name of the permission required to use the command.
     * @type {String}
     */
    this.permission = permission || 'Anyone'
    /**
     * The command function.
     * @type {Function}
     */
    this.run = run
  }
  /**
   * Get information about the command.
   * @return {String} Info string containing name and description.
   */
  help () {
    return `Name: ${this.name}\nDescription: ${this.description}\nParameters:${this.parameters.join(', ')}`
  }
}

module.exports = Command
