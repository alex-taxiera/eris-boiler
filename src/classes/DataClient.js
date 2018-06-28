/**
 * @external {Client}     https://abal.moe/Eris/docs/Client
 */
const DatabaseManager = require('./DatabaseManager.js')
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
    this.dbm = new DatabaseManager(config.DB_CREDENTIALS, Logger)
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

    this._guild_settings = new Map()
    this._guild_toggles = new Map()

    this._setup()
  }

  async getGuildSettings (id) {
    if (this._guild_settings.get(id)) return this._guild_settings.get(id)
    const dbData = await this.dbm.getSettings(id)
    this._guild_settings.set(id, dbData)
    return dbData
  }

  async getGuildToggles (id) {
    if (this._guild_toggles.get(id)) return this._guild_toggles.get(id)
    const dbData = await this.dbm.getToggles(id)
    this._guild_toggles.set(id, dbData)
    return dbData
  }
  async memberCan (member, permission) {
    return (await this.permissionLevel(member) >= permission.level)
  }
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
    this.dbm.updateSettings(id, settings)
    const old = this._guild_toggles.get(id)
    for (const key in old) {
      if (!settings[key]) settings[key] = old[key]
    }
    this._guild_settings.set(id, settings)
  }

  updateGuildToggles (id, toggles) {
    this.dbm.updateToggles(id, toggles)
    const old = this._guild_toggles.get(id)
    for (const key in old) {
      if (!toggles[key]) toggles[key] = old[key]
    }
    this._guild_toggles.set(id, toggles)
  }

  /**
   * Set up all data for DataClient.
   */
  async _setup () {
    const { readdir } = require('fs').promises
    /* set up database */
    this.dbm.setup(this)
    const dirs = {
      permissions: path.join(__dirname, '../permissions/'),
      commands: path.join(__dirname, '../commands/'),
      events: path.join(__dirname, '../events/'),
      settings: path.join(__dirname, '../settings/'),
      toggles: path.join(__dirname, '../toggles/')
    }

    for (const dir in dirs) {
      const directory = dirs[dir]
      await readdir(directory).then((files) => {
        this.logger.log(`Loading a total of ${files.length} ${dir}`)
        for (let i = 0; i < files.length; i++) {
          try {
            let file = require(path.join(directory, files[i]))
            if (dir === 'permissions') {
              this[dir].set(file.name, file)
              continue
            }
            if (dir === 'events') {
              this.on(files[i].split('.')[0], file.bind(null, this))
              delete require.cache[require.resolve(path.join(directory, files[i]))]
              continue
            }
            file = file(this)
            if (dir === 'commands') {
              for (let i = 0; i < file.aliases.length; i++) {
                this.aliases.set(file.aliases[i], file.name)
              }
            }
            this[dir].set(file.name, file)
          } catch (e) {
            this.logger.error(`Unable to load ${dir} ${files[i]}:\n${e}`)
          }
        }
      }).catch(this.logger.error)
    }
  }

  /**
   * Load a command.
   * @param {String} commandFile Name of command file to load.
   */
  _loadCommand (commandFile) {
    if (!commandFile.endsWith('.js')) return
    try {
      const command = require(path.join(__dirname, `../commands/${commandFile}`))(this.permissions)
      this.commands.set(command.name, command)
      for (let i = 0; i < command.aliases.length; i++) {
        this.aliases.set(command.aliases[i], command.name)
      }
    } catch (e) {
      this.logger.error(`Unable to load command ${commandFile}:\n${e}`)
    }
  }
}

module.exports = DataClient
