/**
 * @external {Client}     https://abal.moe/Eris/docs/Client
 */
const DatabaseManager = require('./DatabaseManager.js')
const QueryBuilder = require('./QueryBuilder.js')
const Orator = require('./Orator.js')
const Logger = require('./Logger.js')
const Status = require('./Status.js')
const path = require('path')
/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends require('eris').Client {
  /**
   * Create a client.
   * @param {Object}  config                         The this config data.
   * @param {String}  config.TOKEN                   The this token.
   * @param {Object}  config.DB_CREDENTIALS          The database credentials.
   * @param {String}  config.DB_CREDENTIALS.database The name of the database.
   * @param {String}  config.DB_CREDENTIALS.host     The host address of the server.
   * @param {String}  config.DB_CREDENTIALS.user     The username to login with.
   * @param {String}  config.DB_CREDENTIALS.password The password to login with.
   * @param {Object}  config.DEFAULT                 The bots default values.
   * @param {String}  config.DEFAULT.prefix          The default prefix.
   * @param {Boolean} config.DEFAULT.rotateStatus    The default for changing this status.
   * @param {Object}  config.DEFAULT.status          The default this status.
   * @param {String}  config.DEFAULT.status.name     The default this status name.
   * @param {Number}  config.DEFAULT.status.type     The default this status type.
   * @param {Boolean} config.DEFAULT.status.default  The boolean indicating to the database that this is the default status.
   * @param {Object}  options                        Same as Client.
   */
  constructor (config, options) {
    super(config.TOKEN, options)
    /**
     * The this config data.
     * @type     {Object}
     * @property {String}  config.TOKEN                   The this token.
     * @property {Object}  config.DB_CREDENTIALS          The database credentials.
     * @property {String}  config.DB_CREDENTIALS.database The name of the database.
     * @property {String}  config.DB_CREDENTIALS.host     The host address of the server.
     * @property {String}  config.DB_CREDENTIALS.user     The username to login with.
     * @property {String}  config.DB_CREDENTIALS.password The password to login with.
     * @property {Object}  config.DEFAULT                 The bots default values.
     * @property {String}  config.DEFAULT.prefix          The default prefix.
     * @property {Boolean} config.DEFAULT.rotateStatus    The default for changing this status.
     * @property {Object}  config.DEFAULT.status          The default this status.
     * @property {String}  config.DEFAULT.status.name     The default this status name.
     * @property {Number}  config.DEFAULT.status.type     The default this status type.
     * @property {Boolean} config.DEFAULT.status.default  The boolean indicating to the database that this is the default status.
     */
    this.config = config
    /**
     * The logger.
     * @type {Logger}
     */
    this.logger = new Logger()
    /**
     * The DatabaseManager.
     * @type {DatabaseManager}
     */
    this.dbm = new DatabaseManager(this, config.DB_CREDENTIALS, Logger, QueryBuilder)
    /**
     * The Orator.
     * @type {Orator}
     */
    this.ora = new Orator(Logger, { analytics: true })
    /**
     * The Status handler.
     * @type {Status}
     */
    this.status = new Status()
    /**
     * The command map.
     * @type {Map}
     */
    this.commands = new Map()
    /**
     * The command alias map.
     * @type {Map}
     */
    this.aliases = new Map()
    /**
     * The permission map.
     * @type {Map}
     */
    this.permissions = new Map()
    /**
     * The setting map.
     * @type {Map}
     */
    this.settings = new Map()
    /**
     * The toggle map.
     * @type {Map}
     */
    this.toggles = new Map()

    /**
     * The directories to load files from.
     * @private
     * @type {Object}
     */
    this._dirs = {
      permissions: path.join(__dirname, '../permissions/'),
      commands: path.join(__dirname, '../commands/'),
      events: path.join(__dirname, '../events/'),
      settings: path.join(__dirname, '../settings/'),
      toggles: path.join(__dirname, '../toggles/')
    }
    /**
     * The guild settings cache.
     * @type {Map}
     */
    this._guild_settings = new Map()
    /**
     * The guild toggles cache.
     * @type {Map}
     */
    this._guild_toggles = new Map()

    this._setup()
  }

  getGuildSettings (id) {
    return this._getData(id, '_guild_settings', this.dbm.getSettings)
  }

  getGuildToggles (id) {
    return this._getData(id, '_guild_toggles', this.dbm.getToggles)
  }
  /**
   * Whether or not a member can has a certain permission.
   * @param  {GuildMember} member     The member in question.
   * @param  {Permission}  permission The permission in question.
   * @return {Boolean}                True if they can and false if they cannot.
   */
  async memberCan (member, permission) {
    return (await this.permissionLevel(member) >= permission.level)
  }
  /**
   * Get the permission level of a member.
   * @param {GuildMember} member The GuildMember in question.
   * @return {Number}            The numerical value of the permission level.
   */
  async permissionLevel (member) {
    const perms = this.permissions.values()
    let permLevel = 0
    let val = perms.next().value
    while (val) {
      if (val.level > permLevel && await val.check(member, this)) permLevel = val.level
      val = perms.next().value
    }
    return permLevel
  }

  updateGuildSettings (id, settings) {
    this._updateCache(id, '_guild_settings', settings, this.dbm.updateSettings)
  }

  updateGuildToggles (id, toggles) {
    this._updateCache(id, '_guild_toggles', toggles, this.dbm.updateToggles)
  }

  async _getData (id, cache, dbGet) {
    if (this._inCache(id, cache)) return this[cache].get(id)
    const dbData = await dbGet(id)
    this[cache].set(id, dbData)
    return dbData
  }

  _inCache (id, cache) {
    return this[cache].get(id) != null
  }
  /**
   * Load the command files.
   * @private
   * @param {String}   directory Path to command directory.
   * @param {String}   name      Name of command directory.
   * @param {String[]} files     List of command file names.
   */
  _loadCommands (directory, name, files) {
    for (let i = 0; i < files.length; i++) {
      try {
        const file = require(path.join(directory, files[i]))(this)
        for (let i = 0; i < file.aliases.length; i++) {
          this.aliases.set(file.aliases[i], file.name)
        }
        this[name].set(file.name, file)
      } catch (e) {
        this.logger.error(`Unable to load ${name} ${files[i]}:\n\t\t${e}`)
      }
    }
  }
  /**
   * Load the event files.
   * @private
   * @param {String}   directory Path to event directory.
   * @param {String}   name      Name of event directory.
   * @param {String[]} files     List of event file names.
   */
  _loadEvents (directory, name, files) {
    for (let i = 0; i < files.length; i++) {
      try {
        const file = require(path.join(directory, files[i]))
        this.on(files[i].split('.')[0], file.bind(null, this))
        delete require.cache[require.resolve(path.join(directory, files[i]))]
      } catch (e) {
        this.logger.error(`Unable to load ${name} ${files[i]}:\n\t\t${e}`)
      }
    }
  }
  /**
   * Load the permission files.
   * @private
   * @param {String}   directory Path to permission directory.
   * @param {String}   name      Name of permission directory.
   * @param {String[]} files     List of permission file names.
   */
  _loadPermissions (directory, name, files) {
    for (let i = 0; i < files.length; i++) {
      try {
        const file = require(path.join(directory, files[i]))
        this[name].set(file.name, file)
      } catch (e) {
        this.logger.error(`Unable to load ${name} ${files[i]}:\n\t\t${e}`)
      }
    }
  }
  /**
   * Load the setting files.
   * @private
   * @param {String}   directory Path to setting directory.
   * @param {String}   name      Name of setting directory.
   * @param {String[]} files     List of setting file names.
   */
  _loadSettings (directory, name, files) {
    for (let i = 0; i < files.length; i++) {
      try {
        const file = require(path.join(directory, files[i]))(this)
        this[name].set(file.name, file)
      } catch (e) {
        this.logger.error(`Unable to load ${name} ${files[i]}:\n\t\t${e}`)
      }
    }
  }

  _updateCache (id, cache, data, dbUpdate) {
    dbUpdate(id, data)
    const old = this[cache].get(id)
    for (const key in old) {
      if (!data[key]) data[key] = old[key]
    }
    this[cache].set(id, data)
  }

  /**
   * Set up all data for DataClient.
   * @private
   */
  async _setup () {
    const { readdir } = require('fs').promises

    for (const name in this._dirs) {
      const directory = this._dirs[name]
      await readdir(directory).then((files) => {
        this.logger.log(`Loading a total of ${files.length} ${name}`)
        switch (name) {
          case 'permissions':
            this._loadPermissions(directory, name, files)
            break
          case 'events':
            this._loadEvents(directory, name, files)
            break
          case 'commands':
            this._loadCommands(directory, name, files)
            break
          case 'settings':
          case 'toggles':
            this._loadSettings(directory, name, files)
            break
          default:
            this.logger.error(`no "${name}" directory!`)
        }
      }).catch(this.logger.error)
    }
  }
}

module.exports = DataClient
