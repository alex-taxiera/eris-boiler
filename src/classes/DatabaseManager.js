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
  constructor (DB_CREDENTIALS, Logger) {
    /**
     * The knex query builder.
     * @private
     * @type    {Function}
     */
    this._knex = require('knex')({ client: 'mysql', connection: DB_CREDENTIALS })
    /**
     * The logger.
     * @private
     * @type    {Logger}
     */
    this._logger = new Logger()
  }

  /**
   * Insert a guild into the guild_settings table.
   * @param  {String}             id The ID of the guild
   * @return {(Number|undefined)}    Returns 0 on success or undefined.
   */
  async addClient (id) {
    return this._insert({ table: 'guild_settings', data: { id } })
      .then(() => { this._insert({ table: 'guild_toggles', data: { id } }) })
  }

  /**
   * Insert a status into the statuses table.
   * @param  {String}             name   The name of the status.
   * @param  {Number}             [type] The type of the status.
   * @return {(Number|undefined)}        Returns 0 on success or undefined.
   */
  addStatus (name, type) {
    return this._insert({ table: 'statuses', data: { name, type } })
  }

  /**
   * Get data on a guild from the guild_settings table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getSettings (id) {
    return this._get({ table: 'guild_settings', where: { id } })
  }

  /**
   * Get data on a guild from the guild_toggles table
   * @param  {String} id The ID of the guild.
   * @return {Object}    The guild data.
   */
  getToggles (id) {
    return this._get({ table: 'guild_toggles', where: { id } })
  }

  /**
   * Get the statuses of the bot from the statuses table.
   * @return {Object[]} Array of statuses, name and type.
   */
  getStatuses () {
    return this._select({ table: 'statuses', columns: ['name', 'type'] })
  }

  /**
   * Check saved guild data against live guild data.
   * @param {Collection<Guild>} guilds The bots collection of guilds at start up.
   */
  async initialize (guilds) {
    let tmpGuilds = new Map(guilds)
    const saved = await this._select({ table: 'guild_settings' })
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
      .then(() => this._delete({ table: 'guild_toggles', where: { id } }))
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
   * Setup database tables.
   * @param  {DataClient} bot The bot client.
   * @return {Promise[]}      The results of the table creation.
   */
  async setup (bot) {
    const tables = []
    tables.push(this._knex.schema.hasTable('guild_settings')
      .then((exists) => {
        if (exists) return
        return this._knex.schema.createTable('guild_settings', (table) => {
          table.charset('utf8')
          table.string('id').primary()
          table.string('vip')
          table.string('prefix').defaultTo(bot.config.DEFAULT.prefix)
          /* role IDs */
          table.text('trackedRoles', 'longtext')
        })
      })
      .catch(this._logger.error)
    )

    tables.push(this._knex.schema.hasTable('guild_toggles')
      .then((exists) => {
        if (exists) return
        return this._knex.schema.createTable('guild_toggles', (table) => {
          table.charset('utf8')
          table.string('id').primary()
          table.boolean('game').defaultTo(true)
          table.boolean('watch').defaultTo(true)
          table.boolean('listen').defaultTo(true)
          table.boolean('stream').defaultTo(true)
        })
      })
      .catch(this._logger.error)
    )
    tables.push(this._knex.schema.hasTable('statuses')
      .then((exists) => {
        if (exists) return
        return this._knex.schema.createTable('statuses', (table) => {
          table.charset('utf8')
          table.string('name').primary()
          table.integer('type').defaultTo(0)
          table.boolean('default').defaultTo('false')
        }).then(() =>
          this._insert({ table: 'statuses', data: bot.config.DEFAULT.status })
        )
      })
      .catch(this._logger.error)
    )

    return Promise.all(tables)
  }

  /**
   * Update the default status of the bot.
   * @param  {Object}             status      The status to make default.
   * @param  {String}             status.name The name of the status.
   * @param  {Number}             status.type The type of the status.
   * @return {(Number|undefined)}             Returns 0 on success or undefined.
   */
  updateDefaultStatus (data) {
    return this._update({ table: 'games', data, where: { default: 1 } })
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

  /**
   * Update a guild entry in the guild_settings table.
   * @param  {String}             id       The ID of the guild.
   * @param  {Object}             settings The data to update. Property names should match column names.
   * @return {(Number|undefined)}          Returns 0 on success or undefined.
   */
  updateSettings (id, settings) {
    return this._update({ table: 'guild_settings', data: settings, where: { id } })
  }

  /**
   * Update a guild entry in the guild_toggles table.
   * @param  {String}             id      The ID of the guild.
   * @param  {Object}             toggles The data to update. Property names should match column names.
   * @return {(Number|undefined)}         Returns 0 on success or undefined.
   */
  updateToggles (id, toggles) {
    return this._update({ table: 'guild_toggles', data: toggles, where: { id } })
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
      .catch(this._logger.error)
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
      .catch(this._logger.error)
  }

  /**
   * Get the first entry from a table matching a condition.
   * @private
   * @param   {Object}            data               The query data.
   * @param   {String}            data.table         The name of the table.
   * @param   {(String[]|String)} [data.columns='*'] The column(s) to select.
   * @param   {Object}            [data.where=true]  The column names and values to match.
   * @return  {Object}                               The first matching row.
   */
  async _get ({ table, columns = '*', where = true }) {
    return (await this._select({ table, columns, limit: 1, where }))[0]
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
      .catch(this._logger.error)
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
      .catch(this._logger.error)
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
      .catch(this._logger.error)
  }
}

module.exports = DatabaseManager
