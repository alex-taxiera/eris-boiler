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
        .where({ id: object.id })
        .update(object._data)

      return res
    }

    async get (query) {
      const rows = await this._qb(query.type)
        .select('*')
        .where({ [query.getKey]: query.getValue })

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

    createTable ({ name, columns }) {
      return this._qb.schema.hasTable(name)
        .then((exists) => {
          if (exists) {
            throw Error(`Table with name ${name} already exists.`)
          }
          return this._qb.schema.createTable(name, (table) => {
            if (this._qb.client.config.client === 'mysql') {
              table.charset('utf8')
            }
            for (const column of columns) {
              if (!table[column.type]) {
                throw Error(
                  `'${column.name}' uses '${column.type}'
                which is not an existing type.`
                )
              }
              if (column.primary === true && column.default !== undefined) {
                table[column.type](column.name)
                  .primary()
                  .defaultTo(column.default)
              } else if (column.primary === true) {
                table[column.type](column.name)
                  .primary()
              } else if (column.default !== undefined) {
                table[column.type](column.name)
                  .defaultTo(column.default)
              } else {
                table[column.type](column.name)
              }
            }
          })
            .then(() => {
              return {
                name,
                columns
              }
            })
        })
    }

    dropTable (table) {
      return this._qb.schema.dropTableIfExists(table)
        .then(() => table)
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
