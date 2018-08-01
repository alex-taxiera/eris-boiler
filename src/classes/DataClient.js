/**
 * @external {Client}     https://abal.moe/Eris/docs/Client
 */
const DatabaseManager = require('./DatabaseManager.js')
const QueryBuilder = require('./QueryBuilder.js')
const Orator = require('./Orator.js')
const Logger = require('./Logger.js')
const Status = require('./Status.js')
const settingDefaults = require('../../config/settings.json')
const dbDefaults = require('../../config/database.json')
const path = require('path')
/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends require('eris').Client {
  /**
   * Create a client.
   * @param {Object} options                 Same as Client.
   * @param {String} options.sourceFolder    Source folder to check for data folders such as commands (path from root).
   * @param {Object} options.defaultSettings Default values for settings.
   * @param {Object} options.tables          Additional database tables to create.
   */
  constructor (options = {}) {
    super(process.env.TOKEN, options)
    /**
     * The default settings.
     * @type {Object}
     */
    this.defaultSettings = { ...settingDefaults, ...options.defaultSettings }
    /**
     * The logger.
     * @type {Logger}
     */
    this.logger = new Logger()
    /**
     * The DatabaseManager.
     * @type {DatabaseManager}
     */
    this.dbm = new DatabaseManager(this._combineTables(dbDefaults, options.tables), Logger, QueryBuilder)
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
     * Source folder to check for data folders such as commands (path from root).
     * @private
     * @type    {String}
     */
    this._sourceFolder = options.sourceFolder
    // load everything
    this._setup()
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
  /**
   * @private
   */
  _combineTables (defaultTables, newTables) {
    const results = defaultTables
    for (const table in newTables) {
      if (results[table]) {
        for (const column in newTables[table]) {
          results[table][column] = { ...defaultTables[table][column], ...newTables[table][column] }
        }
      } else {
        results[table] = newTables[table]
      }
    }
    return results
  }
  _getDirectories () {
    return {
      defaultDirectories: {
        permissions: path.join(__dirname, '../permissions/'),
        commands: path.join(__dirname, '../commands/'),
        events: path.join(__dirname, '../events/'),
        settings: path.join(__dirname, '../settings/'),
        toggles: path.join(__dirname, '../toggles/')
      },
      userDirectories: {
        permissions: path.join(process.cwd(), `${this._sourceFolder}/permissions/`),
        commands: path.join(process.cwd(), `${this._sourceFolder}/commands/`),
        events: path.join(process.cwd(), `${this._sourceFolder}/events/`),
        settings: path.join(process.cwd(), `${this._sourceFolder}/settings/`),
        toggles: path.join(process.cwd(), `${this._sourceFolder}/toggles/`)
      }
    }
  }
  /**
   * Load data files.
   * @private
   * @param   {String}   directory Path to permission directory.
   * @param   {String}   name      Name of permission directory.
   * @param   {String[]} files     List of permission file names.
   */
  _loadData (directory, name, files, loader) {
    for (let i = 0; i < files.length; i++) {
      try {
        loader(name, require(path.join(directory, files[i])))
      } catch (e) {
        this.logger.error(`Unable to load ${name} ${files[i]}:\n\t\t\u0020${e}`)
      }
    }
  }
  /**
   * @private
   */
  _permissionLoader (name, data) {
    this[name].set(data.name, data)
  }
  /**
   * @private
   */
  _settingLoader (name, data) {
    this[name].set(data.name, data)
    if (this.defaultSettings[data.name]) {
      this[name].get(data.name).value = this.defaultSettings[data.name]
    }
  }
  /**
   * @private
   */
  _commandLoader (name, data) {
    data = data(this)
    for (let i = 0; i < data.aliases.length; i++) {
      this.aliases.set(data.aliases[i], data.name)
    }
    this[name].set(data.name, data)
  }
  /**
   * @private
   */
  _eventLoader (name, data) {
    this.on(data.name, data.run.bind(null, this))
  }
  /**
   * Select a loader based on type
   * @private
   * @param   {String}   name The directory name/file type.
   * @return  {Function}      The proper loader function.
   */
  _selectLoader (name) {
    switch (name) {
      case 'commands':
        return this._commandLoader
      case 'events':
        return this._eventLoader
      case 'permissions':
        return this._permissionLoader
      case 'settings':
      case 'toggles':
        return this._settingLoader
      default:
        this.logger.error(`no "${name}" directory!`)
    }
  }
  /**
   * Set up all data for DataClient.
   * @private
   */
  async _setup () {
    const { readdir } = require('fs').promises
    const { defaultDirectories, userDirectories } = this._getDirectories()
    for (const name in defaultDirectories) {
      let defaultFiles = await readdir(defaultDirectories[name])
        .catch(this.logger.error)
      const userFiles = await readdir(userDirectories[name])
        .catch(() => this.logger.warn(`You don't have the ${name} folder in your source folder!`))
      defaultFiles = userFiles
        ? defaultFiles.filter((file) => !userFiles.includes(file))
        : defaultFiles
      const total = userFiles
        ? defaultFiles.length + userFiles.length
        : defaultFiles.length
      this.logger.log(`Loading a total of ${total} ${name}`)
      const loader = this._selectLoader(name)
      if (loader) {
        this._loadData(defaultDirectories[name], name, defaultFiles, loader.bind(this))
        if (userFiles) this._loadData(userDirectories[name], name, userFiles, loader.bind(this))
      }
    }
  }
}

module.exports = DataClient
