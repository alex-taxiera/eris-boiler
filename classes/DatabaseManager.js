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
   */
  constructor (DB_CREDENTIALS) {
    /**
     * The knex query builder.
     * @private
     * @type    {Function}
     */
    this._knex = require('knex')({ client: 'mysql', connection: DB_CREDENTIALS })
  }

  /**
   * Insert a guild into the guild_settings table.
   * @param  {String}             id The ID of the guild
   * @return {(Number|undefined)}    Returns 0 on success or undefined.
   */
  addClient (id) {
    return this._insert({ table: 'guild_settings', data: { id } })
  }

  /**
   * Insert a status into the statuses table.
   * @param  {Object}             status      The status to make default.
   * @param  {String}             status.name The name of the status.
   * @param  {Number}             status.type The type of the status.
   * @return {(Number|undefined)}             Returns 0 on success or undefined.
   */
  addStatus (status) {
    return this._insert({ table: 'statuses', data: status })
  }

  /**
   * Get data on a guild from the guild_settings table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  async getClient (id) {
    return (await this._select({ table: 'guild_settings', where: { id } }))[0]
  }

  /**
   * Get the statuses of the bot from the statuses table.
   * @return {Object[]} Array of statuses, name and type.
   */
  async getStatuses () {
    return this._select({ table: 'statuses', columns: ['name', 'type'] })
  }

  /**
   * Check saved guild data against live guild data.
   * @param {Collection<Guild>} guilds The bots collection of guilds at start up.
   */
  async initialize (guilds) {
    let tmpGuilds = new Map(guilds)
    const saved = await this._select({ table: 'guild_settings' })
    if (saved) {
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
    for (const [id] of tmpGuilds) {
      this.addClient(id)
    }
  }

  /**
   * Remove a guild from the guild_settings table.
   * @param  {String}             id The guild ID to remove.
   * @return {(Number|undefined)}    Returns 0 on success or undefined.
   */
  removeClient (id) {
    return this._delete({ table: 'guild_settings', where: { id } })
  }

  /**
   * Remove a status from the statuses table.
   * @param  {String}             name The status to remove.
   * @return {(Number|undefined)}      Returns 0 on success or undefined.
   */
  removeStatus (name) {
    return this._delete({ table: 'statuses', where: { name } })
  }

  /**
   * Update a guild entry in the guild_settings table.
   * @param  {String}             id   The ID of the guild.
   * @param  {Object}             data The data to update. Property names should match column names.
   * @return {(Number|undefined)}      Returns 0 on success or undefined.
   */
  updateClient (id, data) {
    return this._update({ table: 'guild_settings', data, where: { id } })
  }

  /**
   * Update the default status of the bot.
   * @param  {Object}             status      The status to make default.
   * @param  {String}             status.name The name of the status.
   * @param  {Number}             status.type The type of the status.
   * @return {(Number|undefined)}             Returns 0 on success or undefined.
   */
  updateDefaultStatus (status) {
    return this._update({ table: 'games', data: status, where: { default: 1 } })
  }

  /**
   * Update the default prefix in the guild_settings table. Not available with SQLite.
   * @param {String} prefix The prefix to set as default.
   */
  updateDefaultPrefix (prefix) {
    this._knex.schema.alterTable('guild_settings', (table) => {
      table.string('prefix').defaultTo(prefix)
    })
  }

  // private methods
  /**
   * Get the number of rows in a table.
   * @private
   * @param   {String}             table The name of the table.
   * @return  {(Number|undefined)}       Returns the number of rows on success or undefined.
   */
  _count (table) {
    return this._knex(table).count('*')
    .then((val) => val[0]['count(*)'])
    .catch((e) => undefined)
  }

  /**
   * Delete an entry from a table.
   * @private
   * @param   {Object}             data       The query data.
   * @param   {String}             data.table The name of the table.
   * @param   {Object}             data.where The condition to be met to find what to delete. Property name should match column name.
   * @return  {(Number|undefined)}            Returns 0 on success or undefined.
   */
  _delete ({ table, where }) {
    return this._knex(table).where(where).del()
    .then((success) => 0)
    .catch((e) => undefined)
  }

  /**
   * Insert an entry into a table.
   * @private
   * @param   {Object}             data       The query data.
   * @param   {String}             data.table The name of the table.
   * @param   {Object}             data.data  The data to insert. Property names should match column names.
   * @return  {(Number|undefined)}            Returns 0 on success or undefined.
   */
  _insert ({ table, data }) {
    return this._knex(table).insert(data)
    .then((success) => 0)
    .catch((e) => undefined)
  }

  /**
   * Select entries from a table.
   * @private
   * @param   {Object}               data               The query data.
   * @param   {String}               data.table         The name of the table.
   * @param   {(String[]|String)}    [data.columns='*'] The column(s) to select.
   * @param   {Number}               [data.offset=0]    The amount of rows to skip before selecting.
   * @param   {Number}               [data.limit=null]  The amount of rows to select. Will be set to all columns if null.
   * @param   {Object}               [data.where=true]  The condition to match your selection against. Property name should match column name.
   * @return  {(Object[]|undefined)}                    Returns array of rows on success or undefined.
   */
  async _select ({ table, columns = '*', offset = 0, limit = null, where = true }) {
    if (!limit) limit = (await this._count(table)) || 0
    return this._knex(table).select(columns).where(where).offset(offset).limit(limit)
    .then((rows) => rows)
    .catch((e) => undefined)
  }

  /**
   * Update entries in a table.
   * @private
   * @param   {Object}             data       The query data.
   * @param   {String}             data.table The name of the table.
   * @param   {Object}             data.where The condition to be met to find what to update. Property name should match column name.
   * @param   {Object}             data.data  The data to update. Property names should match column names.
   * @return  {(Number|undefined)}            Returns 0 on success or undefined.
   */
  _update ({ table, where, data }) {
    return this._knex(table).where(where).update(data)
    .then((success) => 0)
    .catch((e) => undefined)
  }
}

module.exports = DatabaseManager
