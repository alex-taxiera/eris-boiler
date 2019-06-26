const DatabaseManager = require('../database-manager')
const QueryBuilder = require('simple-knex')
/**
 * Class representing an SQLDatabaseManager.
 * @extends {DatabaseManager}
 */
class SQLManager extends DatabaseManager {
  constructor ({ DataQuery, DataObject, dbInfo }) {
    super({ DataQuery, DataObject })
    this._qb = new QueryBuilder(dbInfo)
  }

  async add (type, data) {
    return this._qb.insert({ table: type, data })
  }

  async delete (object) {
    return this._qb.delete({
      table: object.type,
      where: { id: object.id }
    })
  }

  async update (object) {
    return this._qb.update({
      table: object.type,
      data: object._data,
      where: { id: object.id }
    })
  }

  async get (query) {
    return this._qb.get({ table: query.type, where: { id: query.getId } })
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
      (builder, { type, query }) =>
        builder[type === 'and' ? 'andWhere' : 'orWhere'](
          (builder) => this._whereBuilder(query, builder)
        ),
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
