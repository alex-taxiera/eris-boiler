class DatabaseQuery {
  constructor (databaseManager, type) {
    this._dbm = databaseManager
    this.type = type
    this.limit = 9999
    this.conditionMap = {}
    this.sort = {}
    this.getId = null
    this.orQueries = []
    this.andQueries = []
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
    return this._addCondition(prop, '=', val)
  }

  notEqualTo (prop, val) {
    return this._addCondition(prop, '!=', val)
  }

  lessThan (prop, num) {
    return this._addCondition(prop, '<', num)
  }

  greaterThan (prop, num) {
    return this._addCondition(prop, '>', num)
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

  _addCondition (prop, op, value) {
    this.conditionMap[prop] = { op, value }
    return this
  }

  _addSubqueries (type, queries) {
    this[type + 'Queries'].concat(this._sanitizeQueries(queries))
    return this
  }

  _sanitizeQueries (queries) {
    return queries.map((query) => {
      const {
        type,
        conditionMap,
        orQueries,
        andQueries
      } = query

      if (this.type !== type) {
        throw TypeError('mismatched query types')
      }

      return {
        conditionMap,
        orQueries,
        andQueries
      }
    })
  }
}

module.exports = DatabaseQuery
