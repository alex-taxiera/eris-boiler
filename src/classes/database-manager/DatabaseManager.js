/**
 * @external {Collection} https://abal.moe/Eris/docs/Collection
 */
/**
 * Class representing a database manager.
 */
class DatabaseManager {
  /**
   * Create a database manager.
   * @param {Object} tables The tables to add to the database.
   * @param {Class}  Logger The Logger class
   */
  constructor (tables, Logger, QueryBuilder) {
    /**
     * The QueryBuilder.
     * @private
     * @type    {QueryBuilder}
     */
    this._qb = new QueryBuilder()
    /**
     * The logger.
     * @private
     * @type    {Logger}
     */
    this._logger = new Logger()
    /**
     * The table data to create our database with.
     * @private
     * @type    {Object}
     */
    this._tables = tables
  }

  /**
   * Insert a guild into the guild_settings table.
   * @param  {String}            id     The ID of the guild.
   * @param  {String}            prefix The default prefix
   * @return {Promise<Object[]>}        Returns the updated table.
   */
  async addClient (id, prefix) {
    return this._qb.insert({ table: 'guild_settings', data: { id, prefix } })
      .then(() => this._qb.insert({ table: 'guild_toggles', data: { id } }))
  }

  /**
   * Insert a status into the statuses table.
   * @param  {String}            name   The name of the status.
   * @param  {Number}            [type] The type of the status.
   * @param  {Boolean}           [def]  Whether or not this is the default status.
   * @return {Promise<Object[]>}        Returns the updated table.
   */
  addStatus (name, type, def) {
    return this._qb.insert({ table: 'statuses', data: { name, type, default: def } })
  }
  /**
   * Returns the default presence of the bot.
   * @returns {Object}
   */
  getDefaultStatus () {
    return this._qb.get({ table: 'statuses', columns: ['name', 'type'], where: { default: true } })
  }
  /**
   * Get data on a guild from the guild_settings table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getSettings (id) {
    return this._qb.get({ table: 'guild_settings', where: { id } })
  }
  /**
   * Get the statuses of the bot from the statuses table.
   * @return {Object[]} Array of statuses, name and type.
   */
  getStatuses () {
    return this._qb.select({ table: 'statuses', columns: ['name', 'type'] })
  }
  /**
   * Get data on a guild from the guild_toggles table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getToggles (id) {
    return this._qb.get({ table: 'guild_toggles', where: { id } })
  }
  /**
   * Check saved guild data against live guild data.
   * @param {Collection<Guild>} guilds The bots collection of guilds at start up.
   */
  async initialize (guilds, defaultPrefix) {
    await this._createTables(this._tables)
    let tmpGuilds = new Map(guilds)
    const saved = await this._qb.select({ table: 'guild_settings' })
    if (saved && saved.length > 0) {
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
    for (const [id] of tmpGuilds) this.addClient(id, defaultPrefix)
  }

  /**
   * Remove a guild from the guild_settings table.
   * @param  {String}            id The guild ID to remove.
   * @return {Promise<Object[]>}    Returns the updated table.
   */
  removeClient (id) {
    return this._qb.delete({ table: 'guild_settings', where: { id } })
      .then(() => this._qb.delete({ table: 'guild_toggles', where: { id } }))
  }

  /**
   * Remove a status from the statuses table.
   * @param  {String}            name The status to remove.
   * @return {Promise<Object[]>}      Returns the updated table.
   */
  removeStatus (name) {
    return this._qb.delete({ table: 'statuses', where: { name } })
  }

  /**
   * Update the default status of the bot.
   * @param  {String}            name   The name of the status.
   * @param  {Number}            [type] The type of the status.
   * @return {Promise<Object[]>}        Returns the updated table.
   */
  updateDefaultStatus (name, type) {
    return this._qb.update({ table: 'statuses', data: { name, type }, where: { default: 1 } })
  }

  /**
   * Update a guild entry in the guild_settings table.
   * @param  {String}            id       The ID of the guild.
   * @param  {Object}            settings The data to update. Property names should match column names.
   * @return {Promise<Object[]>}          Returns the updated table.
   */
  updateSettings (id, settings) {
    return this._qb.update({ table: 'guild_settings', data: settings, where: { id } })
  }

  /**
   * Update a guild entry in the guild_toggles table.
   * @param  {String}            id      The ID of the guild.
   * @param  {Object}            toggles The data to update. Property names should match column names.
   * @return {Promise<Object[]>}         Returns the updated table.
   */
  updateToggles (id, toggles) {
    return this._qb.update({ table: 'guild_toggles', data: toggles, where: { id } })
  }

  /**
   * Create database tables.
   * @private
   * @param   {Object[]}        config The DB schema.
   * @return  {Promise<Object>}        The results of the table creation.
   */
  async _createTables (tables) {
    for (const name in tables) {
      await this._qb.createTable({ name, columns: tables[name] })
        .then((success) => this._logger.success(`Table ${name} created.`))
        .catch((error) => {
          if (error.message === `Table with name ${name} already exists.`) {
            this._logger.warn(`Table ${name} exists...`)
          }
        })
    }
  }
}

module.exports = DatabaseManager
