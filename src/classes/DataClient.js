/**
 * @external {Client}     https://abal.moe/Eris/docs/Client
 */
const DatabaseManager = require('./DatabaseManager.js')
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

    this._setup()
  }

  getCommand (command) {
    return this.commands.get(command) || this.commands.get(this.aliases.get(command))
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

  /**
   * Set up all data for DataClient.
   */
  async _setup () {
    const { readdir } = require('fs').promises
    /* set up database */
    this.dbm.setup(this)

    /* load permissions */
    await readdir(path.join(__dirname, '../permissions/')).then((permissions) => {
      this.logger.log(`Loading a total of ${permissions.length} permissions`)
      for (let i = 0; i < permissions.length; i++) {
        this._loadPermission(permissions[i])
      }
    })

    /* load commands */
    readdir(path.join(__dirname, '../commands/')).then((commands) => {
      this.logger.log(`Loading a total of ${commands.length} commands`)
      for (let i = 0; i < commands.length; i++) {
        this._loadCommand(commands[i])
      }
    })

    /* load events, bind this to each event function */
    readdir(path.join(__dirname, '../events/')).then((events) => {
      this.logger.log(`Loading a total of ${events.length} events`)
      for (let i = 0; i < events.length; i++) {
        this._loadEvent(events[i])
      }
    })

    /* load settings */
    readdir(path.join(__dirname, '../settings/')).then((settings) => {
      this.logger.log(`Loading a total of ${settings.length} settings`)
      for (let i = 0; i < settings.length; i++) {
        this._loadSetting(settings[i])
      }
    })

    /* load toggles */
    readdir(path.join(__dirname, '../toggles/')).then((toggles) => {
      this.logger.log(`Loading a total of ${toggles.length} toggleable settings`)
      for (let i = 0; i < toggles.length; i++) {
        this._loadToggle(toggles[i])
      }
    })
  }

  /**
   * Load a command.
   * @param {String} commandFile Name of command file to load.
   */
  _loadCommand (commandFile) {
    if (!commandFile.endsWith('.js')) return
    try {
      const command = require(path.join(__dirname, `../commands/${commandFile}`))(this)
      this.commands.set(command.name, command)
      for (let i = 0; i < command.aliases.length; i++) {
        this.aliases.set(command.aliases[i], command.name)
      }
    } catch (e) {
      this.logger.error(`Unable to load command ${commandFile}: ${e}`)
    }
  }

  /**
   * Load an event.
   * @param {String} eventFile Name of event file to load.
   */
  _loadEvent (eventFile) {
    try {
      const eventName = eventFile.split('.')[0]
      const event = require(path.join(__dirname, `../events/${eventFile}`))
      this.on(eventName, event.bind(null, this))
      delete require.cache[require.resolve(path.join(__dirname, `../events/${eventFile}`))]
    } catch (e) {
      this.logger.error(`Unable to load event ${eventFile}: ${e}`)
    }
  }

  /**
   * Load a permission.
   * @param {String} permissionFile Name of permission file to load.
   */
  _loadPermission (permissionFile) {
    try {
      const permission = require(path.join(__dirname, `../permissions/${permissionFile}`))
      this.permissions.set(permission.name, permission)
    } catch (e) {
      this.logger.error(`Unable to load permission ${permissionFile}: ${e}`)
    }
  }

  /**
   * Load a setting.
   * @param {String} settingFile Name of setting file to load.
   */
  _loadSetting (settingFile) {
    try {
      const settingName = settingFile.split('.')[0]
      this.settings.set(settingName, require(path.join(__dirname, `../settings/${settingFile}`))(this))
    } catch (e) {
      this.logger.error(`Unable to load setting ${settingFile}: ${e}`)
    }
  }

  /**
   * Load a toggle.
   * @param {String} toggleFile Name of toggle file to load.
   */
  _loadToggle (toggleFile) {
    try {
      const toggleName = toggleFile.split('.')[0]
      this.toggles.set(toggleName, require(path.join(__dirname, `../toggles/${toggleFile}`))(this))
    } catch (e) {
      this.logger.error(`Unable to load toggle ${toggleFile}: ${e}`)
    }
  }
}

module.exports = DataClient
