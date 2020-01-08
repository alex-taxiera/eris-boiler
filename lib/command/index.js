const {
  ExtendedMap
} = require('../../util')

class Command {
  /**
   * Class representing a command.
   * <T extends DataClient>
   * @param {CommandData<T>} data The CommandData.
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
      permission,
      postHook,
      dmOnly = false,
      guildOnly = false
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
     * @type {CommandAction<T>}
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
     * @type {PostHook}
     */
    this.postHook = postHook
    /**
     * @type {boolean}
     */
    this.dmOnly = dmOnly
    /**
     * @type {boolean}
     */
    this.guildOnly = guildOnly
    /**
     * @type {ExtendedMap<string, Command<T>>}
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

class GuildCommand extends Command {
  /**
   * Class representing a command.
   * <T extends DataClient>
   * @param {CommandData<T>} data The CommandData.
   */
  constructor (...args) {
    super(...args)
    /**
     * @constant {boolean}
     */
    this.guildOnly = true
    /**
     * @constant {boolean}
     */
    this.dmOnly = false
  }
}

class PrivateCommand extends Command {
  /**
   * Class representing a private command.
   * <T extends DataClient>
   * @param {CommandData<T>} data The CommandData.
   */
  constructor (...args) {
    super(...args)
    /**
     * @constant {boolean}
     */
    this.guildOnly = false
    /**
     * @constant {boolean}
     */
    this.dmOnly = true
  }
}
class SettingCommand extends GuildCommand {
  /**
   * Class representing a settings command.
   * <T extends DataClient>
   * @param {SettingCommandData<T>} data The SettingCommandData.
   */
  constructor ({
    getValue,
    displayName,
    ...rest
  }) {
    super({ ...rest })
    /**
     * @type {string}
     */
    this.displayName = displayName
    /**
     * @type {SettingCommandGetValue<T>}
     */
    this.getValue = getValue
  }
}

module.exports = {
  Command,
  GuildCommand,
  PrivateCommand,
  SettingCommand
}

/**
 * @typedef  CommandData
 * @property {string}            name        The command name.
 * @property {string}            description The command description.
 * @property {CommandAction<T>}  run         The command function.
 * @property {CommandOptions<T>} [options]   The command options.
 */
/**
 * @typedef  {CommandData} SettingCommandData
 * @property {SettingCommandGetValue<T>} getValue The getValue function.
 */
/**
 * @typedef  CommandOptions
 * @property {Array<string>}     [aliases=[]]                List of alias names for the command.
 * @property {Array<string>}     [parameters=[]]             List of paremeters that the command takes.
 * @property {Permission}        [permission]                The permission threshold needed to execute this command.
 * @property {PostHook}          [postHook]                  A function to run after successful execution of a command.
 * @property {boolean}           [deleteInvoking=true]       Whether or not the bot should delete the message that invoked this command.
 * @property {boolean}           [deleteResponse=true]       Whether or not the bot should delete the message response from this command.
 * @property {number}            [deleteResponseDelay=10000] How many miliseconds to wait before deleting the bots response.
 * @property {Array<Command<T>>} [subCommands]               The sub commands.
 * @property {boolean}           [dmOnly=false]              Whether or not the command can only be used in a DM channel (overrides guildOnly).
 * @property {boolean}           [dmOnly=true]               Whether or not the command can only be used in a Guild channel.
 */

/**
 * @callback CommandAction
 * @param    {T}                 bot     The DataClient.
 * @param    {CommandContext<T>} context The CommandContext.
 * @returns  {CommandResults|Promise<CommandResults>}
 */

/**
 * @callback SettingCommandGetValue
 * @param    {CommandContext<T>} context The CommandContext.
 * @returns  {string}                    The value of the Setting.
 */

/**
 * @typedef  CommandContext
 * @property {string[]}                     params  The parsed params that make up the invoking message.
 * @property {Message}                      msg     The message from Discord {@link https://abal.moe/Eris/docs/Message|(link)}.
 * @property {TextableChannel|GuildChannel} channel The channel the message was sent in {@link https://abal.moe/Eris/docs/TextableChannel|(link)} {@link https://abal.moe/Eris/docs/GuildChannel|(link)}.
 */

/**
 * @typedef {MessageData|string|Promise<CommandResults>} CommandResults
 */

/**
 * @typedef  MessageData
 * @property {string} content The message content.
 */
