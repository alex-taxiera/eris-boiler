try {
  const DatabaseManager = require('../database-manager')
  const knex = require('knex')

  class SQLManager extends DatabaseManager {
    /**
     * Class representing an SQLDatabaseManager.
     * @extends {DatabaseManager}
     * @param   {ConnectionData}         connection   The connection data for the SQL DB.
     * @param   {DatabaseManagerOptions} [options={}] The DatabaseManagerOptions.
     */
    constructor (
      {
        client,
        connectionInfo: {
          pool,
          ...connection
        }
      },
      options
    ) {
      super(options)
      this._qb = knex({ client, connection, pool: { min: 0, ...pool } })
    }

    async add (type, data) {
      const [ res ] = await this._qb(type)
        .insert(data, '*')

      return res
    }

    async delete (object) {
      await this._qb(object.type)
        .where({ id: object.id })
        .del()
    }

    async update (object) {
      const [ res ] = await this._qb(object.type, '*')
        .update(object._data)
        .where({ id: object.id })

      return res
    }

    async get (query) {
      const rows = await this._qb(query.type)
        .select('*')
        .where(query.getKey, query.getValue)
        .limit(1)

      return rows[0]
    }

    async find (query) {
      const rows = await this._qb(query.type)
        .select('*')
        .where((builder) => this._whereBuilder(query, builder))

      return rows[0] ? rows : []
    }

    _whereBuilder (query, builder) {
      let conditions = Object.entries(query.conditions)
      const whereNots = conditions
        .filter(([ prop, { type } ]) => type === 'notEqualTo')
      conditions = conditions
        .filter(([ prop, { type } ]) => type !== 'notEqualTo')
      builder = query.subQueries.reduce(
        (builder, { type, query }) => {
          for (const q of query) {
            builder = builder[type === 'and' ? 'andWhere' : 'orWhere'](
              (builder) => this._whereBuilder(q, builder)
            )
          }
          return builder
        },
        conditions.reduce(
          (builder, [ prop, { type, value } ]) =>
            builder.andWhere(
              prop,
              this._getOpForQueryType(type),
              value
            ),
          builder.where(true)
        )
      )

      if (whereNots.length > 0) {
        builder = builder.andWhereNot(
          (builder) =>
            whereNots.reduce(
              (builder, [ prop, { value } ]) =>
                builder.andWhere(prop, '=', value),
              builder.where(true)
            )
        )
      }

      return builder
    }

    _getOpForQueryType (type) {
      switch (type) {
        case 'equalTo':
        case 'notEqualTo':
          return '='
        case 'lessThan':
          return '<'
        case 'greaterThan':
          return '>'
        default: throw Error('messed up query')
      }
    }
  }

  module.exports = SQLManager
} catch {
  module.exports = undefined
}

/**
 * @typedef  ConnectionData
 * @property {ConnectionInfo|string} connectionInfo The data used to connect to the database as an object or connection string.
 * @property {string}                client         The database driver to use.
 * @property {PoolInfo}              pool           The pooling config.
 */

/**
 * @typedef  ConnectionInfo
 * @property {string} database   The database name to use.
 * @property {string} user       The user to login as.
 * @property {string} [password] The password to use to login
 * @property {string} host       The host/url/ip to connect to.
 */

/**
 * @typedef  PoolInfo
 * @property {number} min The minimum number of connections.
 * @property {number} max The maximum number of connections.
 */
