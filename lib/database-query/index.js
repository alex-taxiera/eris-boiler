class DatabaseQuery {
  constructor (databaseManager, type) {
    this._dbm = databaseManager
    this.type = type
    this.limit = 9999
    this.conditions = {}
    this.sort = {}
    this.getId = null
    this.subQueries = []
  }

  or (...queries) {
    return this._addSubqueries('or', queries)
  }

  and (...queries) {
    return this._addSubqueries('and', queries)
  }

  limit (num) {
    this.limit = num
    return this
  }

  equalTo (prop, val) {
    return this._addCondition('equalTo', prop, val)
  }

  notEqualTo (prop, val) {
    return this._addCondition('notEqualTo', prop, val)
  }

  lessThan (prop, num) {
    return this._addCondition('lessThan', prop, num)
  }

  greaterThan (prop, num) {
    return this._addCondition('greaterThan', prop, num)
  }

  find () {
    return this._dbm.find(this)
      .then((data) => data.map(
        (json) => this._dbm.newObject(this.type, json, false)
      ))
  }

  get (id) {
    this.getId = id
    return this._dbm.get(this)
      .then((json) => this._dbm.newObject(this.type, json, false))
  }

  _addCondition (type, prop, value) {
    this.conditions[prop] = { type, value }
    return this
  }

  _addSubqueries (type, queries) {
    this.subQueries.concat({ type, query: this._sanitizeQueries(queries) })
    return this
  }

  _sanitizeQueries (queries) {
    return queries.map((query) => {
      const {
        type,
        conditions,
        subQueries
      } = query

      if (this.type !== type) {
        throw TypeError('mismatched query types')
      }

      return {
        conditions,
        subQueries
      }
    })
  }
}

module.exports = DatabaseQuery
