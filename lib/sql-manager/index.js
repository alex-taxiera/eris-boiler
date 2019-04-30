const DatabaseManager = require('../database-manager')
const QueryBuilder = require('simple-knex')
/**
 * Class representing an SQLDatabaseManager.
 * @extends {DatabaseManager}
 */
class SQLManager extends DatabaseManager {
  constructor ({ DataQuery, DataObject, qbOptions }) {
    super({ DataQuery, DataObject })
    this._qb = new QueryBuilder(qbOptions)
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
    const entries = Object.entries(query.conditionMap)
    const hasEntries = !!entries.length
    if (hasEntries) {
      const [ firstKey, firstVal ] = entries.shift()
      builder = entries.reduce(
        (builder, [ key, { op, value } ], index) =>
          builder.andWhere(key, op, value),
        builder.where(firstKey, firstVal.op, firstVal.value)
      )
    }

    if (!hasEntries) {
      if (query.andQueries.length > 0) {
        const and = query.andQueries.shift()
        builder = builder.where((builder) => this._whereBuilder(and, builder))
      } else if (query.orQueries.length > 0) {
        const or = query.orQueries.shift()
        builder = builder.where((builder) => this._whereBuilder(or, builder))
      } else {
        return builder
      }
    }

    const andTypes = [
      { name: 'andQueries', fn: 'andWhere' },
      { name: 'orQueries', fn: 'orWhere' }
    ]

    for (const { name, fn } of andTypes) {
      builder = query[name].reduce(
        (builder, query) =>
          builder[fn]((builder) => this._whereBuilder(query, builder)),
        builder
      )
    }

    return builder
  }
}

module.exports = SQLManager
