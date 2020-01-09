try {
  const DatabaseManager = require('../database-manager')
  const QueryBuilder = require('simple-knex')

class SQLManager extends DatabaseManager {
  /**
   * Class representing an SQLDatabaseManager.
   * @extends {DatabaseManager}
   * @param   {ConnectionData}         connection   The connection data for the SQL DB.
   * @param   {DatabaseManagerOptions} [options={}] The DatabaseManagerOptions.
   */
  constructor (connection, options) {
    super(options)
    this._qb = new QueryBuilder(connection)
  }

    async add (type, data) {
      return this._qb.insert({ table: type, data })
    }

    async delete (object) {
      await this._qb.delete({
        table: object.type,
        where: { id: object.id }
      })
    }

  async update (object) {
    const [ res ] = await this._qb.update({
      table: object.type,
      data: object._data,
      where: { id: object.id }
    })

    return {
      ...res
    }
  }

      return {
        ...res
      }
    }

    async get (query) {
      return this._qb.get({
        table: query.type,
        where: { [query.getKey]: query.getValue }
      })
    }

    async find (query) {
      return this._qb.select({
        table: query.type,
        where: (builder) => this._whereBuilder(query, builder)
      })
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
 * @property {ConnectionInfo} connectionInfo The data used to connect to the database.
 * @property {string}         client         The database driver to use.
 * @property {PoolInfo}       pool           The pooling config.
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
