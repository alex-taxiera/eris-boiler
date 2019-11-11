const { join } = require('path')
const { promises: { readdir, stat } } = require('fs')
const {
  Client
} = require('eris')

const Orator = require('../orator')
const RAMManager = require('../ram-manager')
const StatusManager = require('../status-manager')
const { logger, ExtendedMap } = require('../utils')

const defaults = require('../../config/settings.json')

class DataClient extends Client {
  /**
   * Class representing a DataClient.
   * @extends {Client}
   * @param   {String}            token     The Discord bot token.
   * @param   {DataClientOptions} [options] The DataClient options.
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
     * @type {DatabaseManager}
     */
    this.dbm = databaseManager
    /**
     * @type {Orator}
     */
    this.ora = new Orator(
      defaults.oratorOptions.defaultPrefix,
      { ...defaults.oratorOptions, ...oratorOptions }
    )
    /**
     * @type {StatusManager}
     */
    this.sm = new StatusManager(
      this,
      databaseManager,
      { ...defaults.statusManagerOptions, ...statusManagerOptions }
    )
    /**
     * @type {ExtendedMap<string, Command<this>>}
     */
    this.commands = new ExtendedMap()
    /**
     * @type {ExtendedMap<string, Permission>}
     */
    this.permissions = new ExtendedMap()

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

  /**
   * Connect to discord.
   * @returns {Promise<void>}
   */
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

  /**
   * Find a command from commands.
   * @param   {string}                             name     Name of command to search.
   * @param   {ExtendedMap<string, Command<this>>} commands A collection of commands to search instead of the build in commands.
   * @returns {Command<this>|void}
   */
  findCommand (name, commands = this.commands) {
    return commands.find(
      (command) => command.name.toLowerCase() === name.toLowerCase() ||
                   command.aliases.includes(name.toLowerCase())
    )
  }

  /**
   * Ready event handler.
   * @private
   * @returns {void}
   */
  _onReady () {
    logger.success('Connected')
    this._addNewGuilds()
    this._setOwner()
    this.sm.initialize()
  }

  /**
   * guildCreate event handler.
   * @private
   * @param   {Guild}                        guild The guild to add.
   * @returns {Promise<DatabaseObject|void>}       The new guild database object.
   */
  _onGuildCreate (guild) {
    return this._addGuild(guild)
  }

  /**
   * messageCreate event handler.
   * @private
   * @param   {Message}       msg The message that triggered the event {@link https://abal.moe/Eris/docs/Message|(link)}.
   * @returns {Promise<void>}
   */
  _onMessageCreate (msg) {
    return this.ora.processMessage(this, msg)
  }

  /**
   * Check guilds and add new ones.
   * @private
   * @returns {Array<Promise<DatabaseObject|void>>} The list of newly added guild database objects.
   */
  async _addNewGuilds () {
    const dbGuilds = await this.dbm.newQuery('guild').find()
    const toAdd = this.guilds.filter(
      (guild) => !dbGuilds.find((dbGuild) => dbGuild.id === guild.id)
    )
    return Promise.all(toAdd.map((guild) => this._addGuild(guild)))
  }

  /**
   * Add a guild to the database.
   * @private
   * @param   {Guild}                        guild The guild to add.
   * @returns {Promise<DatabaseObject|void>}       The new guild database object.
   */
  _addGuild (guild) {
    return this.dbm.newObject('guild')
      .save({ id: guild.id })
      .catch((error) => {
        logger.error('Could not add guild:', error)
      })
  }

  /**
   * Set bot owner.
   * @private
   * @returns {Promise<void>}
   */
  async _setOwner () {
    this.ownerID = (await this.getOAuthApplication()).owner.id
    logger.success('Set bot owner!')
  }

  /**
   * Load data files.
   * @private
   * @param   {string}           path The path to the loadable file/directory.
   * @returns {LoadableObject[]}      The loadable objects loaded from file.
   */
  async _loadFiles (path) {
    const files = await readdir(path)
    const res = []
    for (const fd of files) {
      if (
        (fd.match(/(?<!\.(?:test|spec))\.[jt]sx?$/)) ||
        (await stat(join(path, fd))).isDirectory()
      ) {
        try {
          let data = require(join(path, fd))
          if (data.__esModule) {
            data = data.default
          }
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

  /**
   * Resolve loadable, be it path or array.
   * @private
   * @param   {Loadable}         loadable Parse a loadable to clean up any arrays or paths.
   * @returns {LoadableObject[]}          The cleaned loadable(s).
   */
  async _resolveLoadables (loadable) {
    if (!Array.isArray(loadable)) {
      loadable = [ loadable ]
    }

    const ax = []
    for (const dx of loadable) {
      if (typeof dx === 'string') {
        ax.push(...(await this._loadFiles(dx)))
      } else {
        ax.push(dx)
      }
    }
    return ax
  }

  /**
   * Add commands to store.
   * @param   {...string|Command<this>|Array<string|Command<this>>} commands Commands to add to store.
   * @returns {DataClient}                                      Current state of DataClient.
   */
  addCommands (...commands) {
    return this._addLoadables(commands, this._commandsToLoad)
  }

  /**
   * Add events to store.
   * @param   {...string|DiscordEvent|Array<string|DiscordEvent>} events Events to add to store.
   * @returns {DataClient}                                              Current state of DataClient.
   */
  addEvents (...events) {
    return this._addLoadables(events, this._eventsToLoad)
  }

  /**
   * Add permissions to store.
   * @param   {...string|Permission|Array<string|Permission>} permissions Permissions to add to store.
   * @returns {DataClient}                                               Current state of DataClient.
   */
  addPermissions (...permissions) {
    return this._addLoadables(permissions, this._permissionsToLoad)
  }

  /**
   * Add loadables to store.
   * @private
   * @param   {Loadable[]} loadables Array of things to load.
   * @param   {Loadable[]} store     Store to save loadables too.
   * @returns {DataClient}           Current state of DataClient.
   */
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

  /**
   * Loads some loadable files, calls correct loader function based on type.
   * @private
   * @param   {string}        type  Type of loadable.
   * @param   {Loadable[]}    store Array of things to load.
   * @returns {Promise<void>}
   */
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

  /**
   * Command loader.
   * @private
   * @param   {Command<this>} command The command to load.
   * @returns {void}
   */
  _loadCommand (command) {
    this.commands.set(command.name, command)
  }

  /**
   * Permission loader.
   * @private
   * @param   {Permission} permission The permission to load.
   * @returns {void}
   */
  _loadPermission (permission) {
    this.permissions.set(permission.level, permission)
  }

  /**
   * Event loader.
   * @private
   * @param   {DiscordEvent} event The event to load.
   * @returns {void}
   */
  _loadEvent (event) {
    this.on(event.name, event.run.bind(null, this))
  }
}

module.exports = DataClient

/**
 * @typedef  DataClientOptions
 * @property {DatabaseManager}      [databaseManager]      The DatabaseManager.
 * @property {OratorOptions}        [oratorOptions]        Params to pass to the Orator class.
 * @property {StatusManagerOptions} [statusManagerOptions] StatusManagerOptions object.
 * @property {Object}               [options.erisOptions]  Options to pass to Eris Client.
 */

/**
 * @typedef {string|LoadableObject|Array<string|LoadableObject>} Loadable
 */

/**
 * @typedef {Command<any>|DiscordEvent<any>|Permission} LoadableObject
 */
