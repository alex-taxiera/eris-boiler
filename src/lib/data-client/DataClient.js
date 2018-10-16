/**
 * The Eris Client.
 * @external Client
 * @see {@link https://abal.moe/Eris/docs/Client|Client}
 */
/**
 * The Eris GuildMember.
 * @external GuildMember
 * @see {@link https://abal.moe/Eris/docs/GuildMember|GuildMember}
 */
const path = require('path')
const QueryBuilder = require('simple-knex')

const {
  DatabaseManager,
  Orator,
  Logger,
  Status
} = require('../')

const settingDefaults = require('../../../config/settings.json')
const dbDefaults = require('../../../config/database.json')
/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends require('eris').Client {
  /**
   * Create a client.
   * @param {Object} options                   Same as Client + token.
   * @param {String} options.token             The bot token.
   * @param {String} [options.sourceFolder]    Source folder to check for data folders such as commands (path from root).
   * @param {Object} [options.defaultSettings] Default values for settings.
   * @param {Object} [options.tables]          Additional database tables to create.
   * @param {Object} [options.qbOptions]       Params to pass to the QueryBuilder class.
   * @param {Object} [options.oraOptions]      Params to pass to the Orator class.
   */
  constructor (options = {}) {
    super(options.token, options)
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
    this.dbm = new DatabaseManager(this._combineTables(dbDefaults || [], options.tables || []), Logger, QueryBuilder, options.qbOptions)
    /**
     * The Orator.
     * @type {Orator}
     */
    this.ora = new Orator(Logger, options.oraOptions)
    /**
     * The current bot Status.
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
     * Directories to load files from.
     * @private
     * @type    {Object}
     */
    this._directories = this._getDirectories(options.sourceFolder)
    /**
     * The interval to switch client status on.
     * @private
     */
    this._statusInterval = undefined
    /**
     * The amount of time to wait between changing statuses.
     * @type    {Number}
     * @private
     */
    this._statusTimer = options.statusTimer || 43200000

    // permanent ready event listener to startup proper
    this.onReady = async (bot) => {
      bot.ownerID = (await bot.getOAuthApplication()).owner.id
      await bot.dbm.initialize(bot.guilds, bot.defaultSettings.prefix)
      bot.logger.success('online')
      if (bot.toggles.get('rotateStatus').value) bot.status.startRotate(bot)
      bot.status.default(bot)
    }
    this.on('ready', this.onReady.bind(null, this))

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
   * @param  {GuildMember} member The GuildMember in question.
   * @return {Number}             The numerical value of the permission level.
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
   * Stop changing status automatically.
   */
  statusRotateEnd () {
    if (this._statusInterval) this._statusInterval = clearInterval(this._statusInterval)
  }
  /**
   * Start rotating the bot status.
   */
  statusRotateStart () {
    this._statusInterval = setInterval(() => { this.statusSet() }, this._statusTimer)
  }
  /**
   * Set the status of the bot.
   * @param {Status} [status] Status to set to, if none is given it will be chosen at random
   */
  async statusSet (status) {
    if (!(status instanceof Status)) {
      status = this.status
      const statuses = await this.dbm.getStatuses()
      if (statuses.length > 1) {
        do {
          status = statuses[Math.floor(Math.random() * statuses.length)]
        } while (Status.equals(status, this.status))
      }
    }
    this.logger.log(`${status.activity} ${status.name}`, 'cyan')
    this.editStatus('online', status)
    this.current = status
  }
  /**
   * Set the status to the default.
   */
  async statusSetDefault () {
    const defaultStatus = this.defaultSettings.status
    let status = await this.dbm.getDefaultStatus()
    if (!status) {
      status = this.defaultSettings.status
      this.dbm.addStatus(status.name, status.type, true)
    } else if (!Status.equals(status, defaultStatus)) {
      status = defaultStatus
      this.dbm.updateDefaultStatus(status.name, status.type)
    }
    return this.statusSet(status)
  }
  /**
   * Combines the default db config with the user supplied config.
   * @private
   * @param   {Object} defaultTables The default database configuration.
   * @param   {Object} newTables     The user supplied database configuration.
   * @return  {Object}               The combined product.
   */
  _combineTables (defaultTables, newTables) {
    const tables = defaultTables
    for (const table of newTables) {
      const i = tables.findIndex((oldTable) => oldTable.name === table.name)
      if (i > -1) {
        for (const column of table.columns) {
          const j = tables[i].columns.findIndex((oldColumn) => oldColumn.name === column.name)
          if (j > -1) {
            tables[i].columns[j] = { ...tables[i].columns[j], ...column }
          } else {
            tables[i].columns.push(column)
          }
        }
      } else {
        tables.push(table)
      }
    }
    return tables
  }
  /**
   * Get the map of default and user directories.
   * @private
   * @return  {Object} defaultDirectories and userDirectories.
   */
  _getDirectories (sourceFolder) {
    return {
      default: {
        permissions: path.join(__dirname, '../../permissions/'),
        commands: path.join(__dirname, '../../commands/'),
        events: path.join(__dirname, '../../events/'),
        settings: path.join(__dirname, '../../settings/'),
        toggles: path.join(__dirname, '../../toggles/')
      },
      user: {
        permissions: path.join(process.cwd(), `${sourceFolder}/permissions/`),
        commands: path.join(process.cwd(), `${sourceFolder}/commands/`),
        events: path.join(process.cwd(), `${sourceFolder}/events/`),
        settings: path.join(process.cwd(), `${sourceFolder}/settings/`),
        toggles: path.join(process.cwd(), `${sourceFolder}/toggles/`)
      }
    }
  }
  /**
   * Load data files.
   * @private
   * @param   {String}   dirName      Name of the data directory.
   * @param   {String[]} defaultFiles List of default files in default directory.
   * @param   {String[]} userFiles    List of user files in user directory.
   * @param   {Function} loader       Loader function for specific file type.
   */
  _loadData (dirName, defaultFiles, userFiles, loader) {
    let total = 0
    if (userFiles) {
      defaultFiles = defaultFiles.filter((file) => !userFiles.includes(file))
      total += userFiles.length
      this._loadFiles(this._directories.user, dirName, userFiles, loader)
    }
    total += defaultFiles.length
    this.logger.log(`Loading a total of ${total} ${dirName}`)
    this._loadFiles(this._directories.default, dirName, defaultFiles, loader)
  }
  /**
   * Load data files.
   * @private
   * @param   {Object}   dirMap  Either default or user directory map.
   * @param   {String}   dirName Name of the data directory.
   * @param   {String[]} files   List of default files in default directory.
   * @param   {Function} loader  Loader function for specific file type.
   */
  _loadFiles (dirMap, dirName, files, loader) {
    for (let i = 0; i < files.length; i++) {
      try {
        loader(require(path.join(dirMap[dirName], files[i])))
      } catch (e) {
        this.logger.error(`Unable to load ${dirName} ${files[i]}:\n\t\t\u0020${e}`)
      }
    }
  }
  /**
   * Load a permission.
   * @private
   * @param   {Permission} data The permission to load.
   */
  _permissionLoader (data) {
    this.permissions.set(data.name, data)
  }
  /**
   * Load a setting or toggle.
   * @private
   * @param   {Setting|Toggle} data The setting or toggle to load.
   */
  _settingLoader (data) {
    const settingType = data.constructor.name.toLowerCase() + 's'
    this[settingType].set(data.name, data)
    if (this.defaultSettings[data.name]) {
      this[settingType].get(data.name).value = this.defaultSettings[data.name]
    }
  }
  /**
   * Load a command.
   * @private
   * @param   {Function} data Function with parameter DataClient returning Command.
   */
  _commandLoader (data) {
    data = data(this)
    for (let i = 0; i < data.aliases.length; i++) {
      this.aliases.set(data.aliases[i], data.name)
    }
    this.commands.set(data.name, data)
  }
  /**
   * Load an event.
   * @private
   * @param   {Event} data The event to load.
   */
  _eventLoader (data) {
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
    for (const dirName in this._directories.default) {
      const defaultFiles = await readdir(this._directories.default[dirName])
        .catch(this.logger.error)
      const userFiles = await readdir(this._directories.user[dirName])
        .catch(() => this.logger.warn(`You don't have the ${dirName} folder in your source folder!`))
      const loader = this._selectLoader(dirName)
      if (loader) this._loadData(dirName, defaultFiles, userFiles, loader.bind(this))
    }
  }
}

module.exports = DataClient
