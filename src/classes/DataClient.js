/**
 * @external {Client}     https://abal.moe/Eris/docs/Client
 */
const DatabaseManager = require('./DatabaseManager.js')
const Logger = require('./Logger.js')
const Status = require('./Status.js')
/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends require('eris') {
  /**
   * Create a client.
   * @param {Object}  config                         The bot config data.
   * @param {String}  config.TOKEN                   The bot token.
   * @param {Object}  config.DB_CREDENTIALS          The database credentials.
   * @param {String}  config.DB_CREDENTIALS.database The name of the database.
   * @param {String}  config.DB_CREDENTIALS.host     The host address of the server.
   * @param {String}  config.DB_CREDENTIALS.user     The username to login with.
   * @param {String}  config.DB_CREDENTIALS.password The password to login with.
   * @param {Object}  config.DEFAULT                 The bots default values.
   * @param {String}  config.DEFAULT.prefix          The default prefix.
   * @param {Boolean} config.DEFAULT.rotateStatus    The default for changing bot status.
   * @param {Object}  config.DEFAULT.status          The default bot status.
   * @param {String}  config.DEFAULT.status.name     The default bot status name.
   * @param {Number}  config.DEFAULT.status.type     The default bot status type.
   * @param {Boolean} config.DEFAULT.status.default  The boolean indicating to the database that this is the default status.
   * @param {Object}  options                        Same as Client.
   */
  constructor (config, options) {
    super(config.TOKEN, options)
    /**
     * The bot config data.
     * @type     {Object}
     * @property {String}  config.TOKEN                   The bot token.
     * @property {Object}  config.DB_CREDENTIALS          The database credentials.
     * @property {String}  config.DB_CREDENTIALS.database The name of the database.
     * @property {String}  config.DB_CREDENTIALS.host     The host address of the server.
     * @property {String}  config.DB_CREDENTIALS.user     The username to login with.
     * @property {String}  config.DB_CREDENTIALS.password The password to login with.
     * @property {Object}  config.DEFAULT                 The bots default values.
     * @property {String}  config.DEFAULT.prefix          The default prefix.
     * @property {Boolean} config.DEFAULT.rotateStatus    The default for changing bot status.
     * @property {Object}  config.DEFAULT.status          The default bot status.
     * @property {String}  config.DEFAULT.status.name     The default bot status name.
     * @property {Number}  config.DEFAULT.status.type     The default bot status type.
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
  }
}

module.exports = DataClient
