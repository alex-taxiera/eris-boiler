class DatabaseQuery {
  /**
   * Class representing a database query.
   * @param {DatabaseManager} databaseManager The DatabaseManager.
   * @param {string}          type            The type of DatabaseObject to query for.
   */
  constructor (databaseManager, type) {
    /**
     * @type    {DatabaseManager}
     * @private
     */
    this._dbm = databaseManager
    /**
     * @type {string}
     */
    this.type = type
    /**
     * @type {number}
     */
    this.maxResults = 9999
    /**
     * @type {any}
     */
    this.conditions = {}
    /**
     * @type {any}
     */
    this.sort = {}
    /**
     * @type {string}
     */
    this.getId = ''
    /**
     * @type {Array<SubQuery>}
     */
    this.subQueries = []
  }

  static or (queries) {
    return DatabaseQuery._compileQueries('or', queries)
  }

  static and (queries) {
    return DatabaseQuery._compileQueries('and', queries)
  }

  static _compileQueries (type, [ first, ...rest ]) {
    const query = first
    for (const q of rest) {
      query[type](q)
    }
    return query
  }

  or (queries) {
    return this._addSubqueries('or', queries)
  }

  and (queries) {
    return this._addSubqueries('and', queries)
  }

  limit (num) {
    this.maxResults = num
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
    this.subQueries.push({ type, query: this._sanitizeQueries(queries) })
    return this
  }

  _sanitizeQueries (queries) {
    if (!Array.isArray(queries)) {
      queries = [ queries ]
    }

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

/**
 * @typedef  SubQuery
 * @property {string}        type  The type of SubQuery.
 * @property {DatabaseQuery} query The SubQuery.
 */
