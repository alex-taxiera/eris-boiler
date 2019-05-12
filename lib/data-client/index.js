const { join } = require('path')
const { promises: { readdir } } = require('fs')
const Eris = require('eris')

const Orator = require('../orator')
const RAMManager = require('../ram-manager')
const StatusManager = require('../status-manager')
const { logger } = require('../utils')

const defaults = require('../../config/settings.json')

/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends Eris.Client {
  /**
   * Create a client.
   * @param {String}               token                          The Discord bot token.
   * @param {DataClientOptions}    [options]                      The DataClient options.
   */
  constructor (token, {
    sourcePath,
    databaseManager = new RAMManager(),
    oraOptions,
    statusManagerOptions,
    erisOptions,
    disabledBoiler: {
      permissions: disabledPermissions = [],
      commands: disabledCommands = [],
      events: disabledEvents = []
    } = {}
  } = {}) {
    super(token, erisOptions)
    /**
     * @type {DatabaseManager} The DatabaseManager.
     */
    this.dbm = databaseManager
    /**
     * @type {Orator} The Orator.
     */
    this.ora = new Orator(
      defaults.oratorOptions.defaultPrefix,
      Object.assign({}, defaults.oratorOptions, oraOptions)
    )
    /**
     * @type {StatusManager} The StatusManager.
     */
    this.sm = new StatusManager(
      this,
      databaseManager,
      Object.assign({}, defaults.statusManagerOptions, statusManagerOptions)
    )
    /**
     * @type {Map} The command map.
     */
    this.commands = new Map()
    /**
     * @type {Map} The command alias map.
     */
    this.aliases = new Map()

    this._commandsToLoad = []

    this._eventsToLoad = []

    // load built in events and commands
    this
      .on('ready', this._onReady.bind(this))
      .on('guildCreate', this._onGuildCreate.bind(this))
      .on('messageCreate', this._onMessageCreate.bind(this))
      .addCommands(join(__dirname, '../../boiler/commands'))
      .addEvents(join(__dirname, '../../boiler/events'))
  }

  async connect () {
    await Promise.all([ this._loadCommands(), this._loadEvents() ])
    logger.info('Connecting to Discord...')
    return super.connect()
  }

  findCommand (name, {
    commands = this.commands,
    aliases = this.aliases
  } = {}) {
    const cmd = commands.get(name) || commands.get(aliases.get(name))
    if (cmd) {
      return {
        bot: this,
        command: cmd
      }
    }
  }

  _onReady () {
    logger.success('Connected')
    this._addNewGuilds()
    this._setOwner()
    this.sm.initialize()
  }

  _onGuildCreate (guild) {
    this.dbm.newObject('guild')
      .save({ id: guild.id })
      .catch((error) => logger.error('Could not add guild:', error))
  }

  _onMessageCreate (msg) {
    this.ora.processMessage(this, msg)
  }

  async _addNewGuilds () {
    const dbGuilds = await this.dbm.newQuery('guild').find()
    const toAdd = this.guilds.filter(
      (guild) => !dbGuilds.find((dbGuild) => dbGuild.id === guild.id)
    )
    return Promise.all(
      toAdd.map(
        ({ id }) =>
          this.dbm.newObject('guild')
            .save({ id })
            .catch((error) => logger.error('Could not add guild:', error))
      )
    )
  }

  async _setOwner () {
    this.ownerID = (await this.getOAuthApplication()).owner.id
    logger.success('Set bot owner!')
  }

  /**
   * Load data files.
   * @private
   * @param   {Object}   dirMap  Either default or user directory map.
   * @param   {String}   dirName Name of the data directory.
   * @param   {String[]} files   List of default files in default directory.
   * @param   {Function} loader  Loader function for specific file type.
   */
  async _loadFiles (path) {
    const files = await readdir(path)
    return files.reduce((ax, dx) => {
      if (dx.endsWith('.js')) {
        try {
          ax.push(require(join(path, dx)))
        } catch (e) {
          logger.error(
            `Unable to read ${path}/${dx}:\n\t\t\u0020${e}`
          )
        }
      }
      return ax
    }, [])
  }

  async _resolveLoadables (loadables) {
    if (!Array.isArray(loadables)) {
      loadables = [ loadables ]
    }

    const ax = []
    for (const dx of loadables) {
      if (typeof dx === 'string') {
        ax.push(...(await this._loadFiles(dx)))
      } else {
        ax.push(dx)
      }
    }
    return ax
  }

  addCommands (commands) {
    this._commandsToLoad.push(commands)
    return this
  }

  addEvents (events) {
    this._eventsToLoad.push(events)
    return this
  }

  async _loadCommands () {
    logger.info('Loading commands...')
    for (let commands of this._commandsToLoad) {
      commands = await this._resolveLoadables(commands)

      for (const command of commands) {
        this.commands.set(command.name, command)
        for (const alias of command.aliases) {
          this.aliases.set(alias, command.name)
        }
      }
    }
  }

  async _loadEvents () {
    logger.info('Loading events...')
    for (let events of this._eventsToLoad) {
      events = await this._resolveLoadables(events)

      for (const event of events) {
        this.on(event.name, event.run.bind(null, this))
      }
    }
  }
}

module.exports = DataClient

/**
 * @typedef  {Object} DataClientOptions                            The DataClient options.
 * @property {String}               [options.sourcePath]           Absolute path to user source folder.
 * @property {DatabaseManager}      [options.databaseManager]      The DatabaseManager.
 * @property {OratorOptions}        [options.oraOptions]           Params to pass to the Orator class.
 * @property {StatusManagerOptions} [options.statusManagerOptions] StatusManagerOptions object.
 * @property {DisabledBoiler}       [options.disabledBoiler]       Default stuff to disable.
 * @property {Object}               [options.erisOptions]          Options to pass to Eris Client.
 */
