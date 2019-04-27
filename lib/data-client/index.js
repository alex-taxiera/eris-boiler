const { resolve, join } = require('path')

const Orator = require('../orator')
const RAMManager = require('../ram-manager')
const StatusManager = require('../status-manager')
const { logger } = require('../utils')

const defaults = require('../../config/settings.json')

/**
 * Class representing a DataClient.
 * @extends {Client}
 */
class DataClient extends require('eris').Client {
  /**
   * Create a client.
   * @param {String}               token                          The Discord bot token.
   * @param {Object}               [options]                      The DataClient options.
   * @param {String}               [options.sourcePath]           Absolute path to user source folder.
   * @param {DatabaseManager}      [options.databaseManager]      The DatabaseManager.
   * @param {OratorOptions}        [options.oraOptions]           Params to pass to the Orator class.
   * @param {StatusManagerOptions} [options.statusManagerOptions] StatusManagerOptions object.
   * @param {Object}               [options.erisOptions]          Options to pass to Eris Client.
   */
  constructor (token, {
    sourcePath,
    databaseManager = new RAMManager(),
    oraOptions,
    statusManagerOptions,
    erisOptions
  } = {}) {
    super(token, erisOptions)
    /**
     * @type {DatabaseManager} The DatabaseManager.
     */
    this.dbm = databaseManager
    /**
     * @type {Orator} The Orator.
     */
    this.ora = new Orator({
      ...defaults.oratorOptions,
      ...oraOptions
    })
    /**
     * @type {StatusManager} The StatusManager.
     */
    this.sm = new StatusManager(this, databaseManager, {
      ...defaults.statusManagerOptions,
      ...statusManagerOptions
    })
    /**
     * @type {Map} The command map.
     */
    this.commands = new Map()
    /**
     * @type {Map} The command alias map.
     */
    this.aliases = new Map()
    /**
     * @type {Map} The permission map.
     */
    this.permissions = new Map()
    /**
     * @private
     * @type    {Object} Directories to load files from
     */
    this._directories = this._getDirectories(sourcePath)

    // permanent ready event listener to startup proper
    this.on('ready', () => this._onReady())

    // load everything
    this._setup()
  }

  findCommand (name) {
    return this.commands.get(name) || this.commands.get(this.aliases.get(name))
  }

  /**
   * Get the permission level of a member.
   * @param  {GuildMember} member The GuildMember in question.
   * @return {Number}             The numerical value of the permission level.
   */
  async permissionLevel (member) {
    let permLevel = 0
    for (const { value: perm } of this.permissions.values()) {
      if (perm.level > permLevel && await perm.check(member, this)) {
        permLevel = perm.level
      }
    }
    return permLevel
  }

  /**
   * Get the map of default and user directories.
   * @private
   * @return  {Object} defaultDirectories and userDirectories.
   */
  _getDirectories (sourcePath) {
    const paths = {
      user: sourcePath,
      default: '../../boiler'
    }

    return Object.keys(paths).reduce((store, key) => Object.assign(store, {
      [key]: {
        permissions: resolve(__dirname, join(paths[key], 'permissions')),
        commands: resolve(__dirname, join(paths[key], 'commands')),
        events: resolve(__dirname, join(paths[key], 'events'))
      }
    }), {})
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
    logger.log(`Loading a total of ${total} ${dirName}`)
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
        loader(require(join(dirMap[dirName], files[i])))
      } catch (e) {
        logger.error(
          `Unable to load ${dirName} ${files[i]}:\n\t\t\u0020${e}`
        )
      }
    }
  }

  _onReady () {
    logger.success('Connected to Discord')
    this._checkGuilds()
    this._setOwner()
    this.sm.initialize()
  }

  async _checkGuilds () {
    const dbGuilds = await this.dbm.query('guild').find()
    const toDelete = dbGuilds.filter((dbGuild) => !this.guilds.find((guild) => guild.id === dbGuild.get('guildId')))
    const toAdd = this.guilds.filter((guild) => !dbGuilds.find((dbGuild) => dbGuild.get('guildId') === guild.id))
    return Promise.all([
      ...toDelete.map((dbGuild) => dbGuild.delete()),
      ...toAdd.map((guild) => this.dbm.add('guild', {
        guildId: guild.id
      }))
    ])
  }

  async _setOwner () {
    logger.warn('Setting bot owner...')
    this.ownerID = (await this.getOAuthApplication()).owner.id
    logger.success('Set bot owner!')
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
   * Load a command.
   * @private
   * @param   {Command} data Function with parameter DataClient returning Command.
   */
  _commandLoader (data) {
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
      default:
        throw Error('UNSUPPORTED FILE TYPE: WHAT THE FUCK')
    }
  }

  /**
   * Set up all data for DataClient.
   * @private
   */
  async _setup () {
    const { readdir } = require('fs').promises
    for (const dirName in this._directories.default) {
      const loader = this._selectLoader(dirName)
      if (loader) {
        const [ defaultFiles, userFiles ] = await Promise.all([
          readdir(this._directories.default[dirName]),
          readdir(this._directories.user[dirName])
            .catch(() => logger.warn(
              `You don't have the ${dirName} folder in your source folder!`
            ))
        ])
        this._loadData(dirName, defaultFiles, userFiles, loader.bind(this))
      }
    }
  }
}

module.exports = DataClient
