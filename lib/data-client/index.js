const { join } = require('path')
const { promises: { readdir, stat } } = require('fs')
const {
  Client,
  Collection
} = require('eris')

const Orator = require('../orator')
const RAMManager = require('../ram-manager')
const StatusManager = require('../status-manager')
const { logger } = require('../utils')

const defaults = require('../../config/settings.json')

/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends Client {
  /**
   * Create a client.
   * @param {String}               token                          The Discord bot token.
   * @param {DataClientOptions}    [options]                      The DataClient options.
   */
  constructor (token, {
    databaseManager = new RAMManager(),
    oratorOptions,
    statusManagerOptions,
    erisOptions,
    disabledEvents = []
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
      { ...defaults.oratorOptions, ...oratorOptions }
    )
    /**
     * @type {StatusManager} The StatusManager.
     */
    this.sm = new StatusManager(
      this,
      databaseManager,
      { ...defaults.statusManagerOptions, ...statusManagerOptions }
    )
    /**
     * @type {Collection} The command map.
     */
    this.commands = new Collection()

    this.permissions = new Collection()

    const fromRoot = (path) => join(__dirname, '../..', path)

    this._commandsToLoad = [ fromRoot('command-lib') ]

    this._eventsToLoad = [ fromRoot('event-lib') ]

    this._permissionsToLoad = [ fromRoot('permission-lib') ]

    // load built in events and commands
    this
      .on('ready', this._onReady.bind(this))
      .on('guildCreate', this._onGuildCreate.bind(this))
      .on('messageCreate', this._onMessageCreate.bind(this))
  }

  async connect () {
    await Promise.all([
      this._loadLoadables('commands', this._commandsToLoad),
      this._loadLoadables('events', this._eventsToLoad),
      this._loadLoadables('permissions', this._permissionsToLoad)
    ])
    this.ora.permissions = this.permissions
    logger.info('Connecting to Discord...')
    return super.connect()
  }

  findCommand (name, { commands = this.commands } = {}) {
    const cmd = commands.find(
      (command) => command.name === name || command.aliases.includes(name)
    )
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
    return this._addGuild(guild)
  }

  _onMessageCreate (msg) {
    return this.ora.processMessage(this, msg)
  }

  async _addNewGuilds () {
    const dbGuilds = await this.dbm.newQuery('guild').find()
    const toAdd = this.guilds.filter(
      (guild) => !dbGuilds.find((dbGuild) => dbGuild.id === guild.id)
    )
    return Promise.all(toAdd.map((guild) => this._addGuild(guild)))
  }

  _addGuild (guild) {
    return this.dbm.newObject('guild')
      .save({ id: guild.id })
      .catch((error) => {
        logger.error('Could not add guild:', error)
      })
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
    const res = []
    for (const fd of files) {
      if (
        (fd.endsWith('.js') && !fd.endsWith('.test.js')) ||
        (await stat(join(path, fd))).isDirectory()) {
        try {
          const data = require(join(path, fd))
          if (!data.isIndex) {
            res.push(data)
          }
        } catch (e) {
          logger.error(
            `Unable to read ${path}/${fd}:\n\t\t\u0020${e}`
          )
        }
      }
    }

    return res
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

  addCommands (...commands) {
    return this._addLoadables(commands, this._commandsToLoad)
  }

  addEvents (...events) {
    return this._addLoadables(events, this._eventsToLoad)
  }

  addPermissions (...permissions) {
    return this._addLoadables(permissions, this._permissionsToLoad)
  }

  _addLoadables (loadables, store) {
    let cx = loadables.length

    while (cx--) {
      if (Array.isArray(loadables[cx])) {
        let i = loadables[cx].length
        while (i--) {
          store.push(loadables[cx][i])
        }
      } else {
        store.push(loadables[cx])
      }
    }

    return this
  }

  async _loadLoadables (type, store) {
    logger.info(`Loading ${type}...`)

    let loader
    switch (type) {
      case 'commands':
        loader = (x) => this._loadCommand(x)
        break
      case 'events':
        loader = (x) => this._loadEvent(x)
        break
      case 'permissions':
        loader = (x) => this._loadPermission(x)
        break
      default: throw Error(`Unknown type: ${type}`)
    }

    for (const loadables of store) {
      for (const loadable of await this._resolveLoadables(loadables)) {
        loader(loadable)
      }
    }
  }

  _loadCommand (command) {
    this.commands.set(command.name, command)
  }

  _loadPermission (permission) {
    this.permissions.set(permission.level, permission)
  }

  _loadEvent (event) {
    this.on(event.name, event.run.bind(null, this))
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
