/**
 * @external {Collection} https://abal.moe/Eris/docs/Collection
 */
/**
 * Class representing a database manager.
 */
class DatabaseManager {
  /**
   * Create a database manager.
   * @param {Object} DB_CREDENTIALS          The credentials to create the db connection. This should be filled in the config file.
   * @param {String} DB_CREDENTIALS.database The name of your database.
   * @param {String} DB_CREDENTIALS.host     The address of your database.
   * @param {String} DB_CREDENTIALS.user     The username to login with.
   * @param {String} DB_CREDENTIALS.password The password associated with your user.
   * @param {Class}  Logger                  The Logger class
   */
  constructor (dbConfig, DB_CREDENTIALS, Logger, QueryBuilder) {
    /**
     * The QueryBuilder.
     * @type {QueryBuilder}
     */
    this._qb = new QueryBuilder(DB_CREDENTIALS, Logger)
    /**
     * The logger.
     * @private
     * @type    {Logger}
     */
    this._logger = new Logger()
    /* set up database */
    this._setup(dbConfig)
  }

  /**
   * Insert a guild into the guild_settings table.
   * @param  {String}             id The ID of the guild
   * @return {(Number|undefined)}    Returns 0 on success or undefined.
   */
  async addClient (id) {
    return this._qb.run('insert', { table: 'guild_settings', data: { id } })
      .then(() => this._qb.run('insert', { table: 'guild_toggles', data: { id } }))
  }

  /**
   * Insert a status into the statuses table.
   * @param  {String}             name   The name of the status.
   * @param  {Number}             [type] The type of the status.
   * @return {(Number|undefined)}        Returns 0 on success or undefined.
   */
  addStatus (name, type) {
    return this._qb.run('insert', { table: 'statuses', data: { name, type } })
  }

  /**
   * Get data on a guild from the guild_settings table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getSettings (id) {
    return this._qb.run('get', { table: 'guild_settings', where: { id } })
  }

  /**
   * Get data on a guild from the guild_toggles table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getToggles (id) {
    return this._qb.run('get', { table: 'guild_toggles', where: { id } })
  }

  /**
   * Get the statuses of the bot from the statuses table.
   * @return {Object[]} Array of statuses, name and type.
   */
  getStatuses () {
    return this._qb.run('select', { table: 'statuses', columns: ['name', 'type'] })
  }

  /**
   * Check saved guild data against live guild data.
   * @param {Collection<Guild>} guilds The bots collection of guilds at start up.
   */
  async initialize (guilds) {
    let tmpGuilds = new Map(guilds)
    const saved = await this._qb.run('select', { table: 'guild_settings' })
    if (saved.length > 0) {
      for (let i = 0; i < saved.length; i++) {
        const id = saved[i].id
        const guild = tmpGuilds.get(id)
        if (guild) {
          tmpGuilds.delete(id)
          if (saved[i].vip && !guild.roles.get(saved[i].vip)) this.updateClient(id, { vip: null })
          continue
        }
        await this.removeClient(saved[i].id)
      }
    }
    for (const [id] of tmpGuilds) this.addClient(id)
  }

  /**
   * Remove a guild from the guild_settings table.
   * @param  {String}             id The guild ID to remove.
   * @return {(Number|undefined)}    Returns 0 on success or undefined.
   */
  removeClient (id) {
    return this._qb.run('delete', { table: 'guild_settings', where: { id } })
      .then(() => this._qb.run('delete', { table: 'guild_toggles', where: { id } }))
  }

  /**
   * Remove a status from the statuses table.
   * @param  {String}             name The status to remove.
   * @return {(Number|undefined)}      Returns 0 on success or undefined.
   */
  removeStatus (name) {
    return this._qb.run('delete', { table: 'statuses', where: { name } })
  }

  /**
   * Update the default status of the bot.
   * @param  {String}             name   The name of the status.
   * @param  {Number}             [type] The type of the status.
   * @return {(Number|undefined)}        Returns 0 on success or undefined.
   */
  updateDefaultStatus (name, type) {
    return this._qb.run('update', { table: 'statuses', data: { name, type }, where: { default: 1 } })
  }

  /**
   * Update the default prefix in the guild_settings table. Not available with SQLite.
   * @param  {String}    prefix The prefix to set as default.
   * @return {undefined}
   */
  updateDefaultPrefix (prefix) {
    this._qb._knex.schema.alterTable('guild_settings', (table) => {
      table.string('prefix').defaultTo(prefix)
    })
  }

  /**
   * Update a guild entry in the guild_settings table.
   * @param  {String}             id       The ID of the guild.
   * @param  {Object}             settings The data to update. Property names should match column names.
   * @return {(Number|undefined)}          Returns 0 on success or undefined.
   */
  updateSettings (id, settings) {
    return this._qb.run('update', { table: 'guild_settings', data: settings, where: { id } })
  }

  /**
   * Update a guild entry in the guild_toggles table.
   * @param  {String}             id      The ID of the guild.
   * @param  {Object}             toggles The data to update. Property names should match column names.
   * @return {(Number|undefined)}         Returns 0 on success or undefined.
   */
  updateToggles (id, toggles) {
    return this._qb.run('update', { table: 'guild_toggles', data: toggles, where: { id } })
  }

  /**
   * Setup database tables.
   * @param  {Object[]}   config The DB schema.
   * @return {Promise[]}         The results of the table creation.
   */
  _setup (config) {
    return Promise.all(config.map((table) => this._qb.run('createTable', table)))
  }
}

module.exports = DatabaseManager
