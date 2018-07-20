class QueryBuilder {
  constructor (config, Logger) {
    /**
     * The knex query builder.
     * @private
     * @type    {Function}
     */
    this._knex = require('knex')({
      client: 'mysql',
      connection: {
        user: config.DB_USER
      },
      pool: { min: 0 }
    })
    /**
     * The logger.
     * @private
     * @type    {Logger}
     */
    this._logger = new Logger()
  }
  /**
   * Run a query.
   * @param  {String} query The type of query to run.
   * @param  {Object} data  The data to use in the query
   * @return {*}            Returns whatever the query called returns.
   * @throws {Error}        Error if no query found matching query param.
   */
  async run (query, data) {
    query = '_' + query
    if (this[query]) {
      const results = await this[query](data)
      return results
    }
    throw Error('NO FUNCTION')
  }

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

  _createTable ({ name, columns, insert }) {
    return this._knex.schema.hasTable(name).then((exists) => {
      if (exists) return
      return this._qb._knex.schema.createTable(name, (table) => {
        table.charset('utf8')
        for (const column of columns) {
          if (column.primary && column.default !== undefined) {
            table[column.type](column.name).primary().defaultTo(column.default)
          } else if (column.primary) {
            table[column.type](column.name).primary()
          } else if (column.default !== undefined) {
            table[column.type](column.name).defaultTo(column.default)
          } else {
            table[column.type](column.name)
          }
        }
      }).then(async () => {
        if (insert !== undefined) {
          for (const data of insert) {
            await this._insert({ table: name, data })
          }
        }
      })
    }).catch(this._logger.error)
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
      .then((rows) => {
        for (let i = 0; i < rows.length; i++) {
          for (const key in rows[i]) {
            try {
              rows[i][key] = JSON.parse(rows[i][key])
            } catch (e) {
              continue
            }
          }
        }
        return rows[0] ? rows : undefined
      })
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

module.exports = QueryBuilder
