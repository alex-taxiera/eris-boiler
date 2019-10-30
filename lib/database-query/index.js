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

  /**
   * OR some queries together.
   * @static
   * @param   {Array<DatabaseQuery>} queries The queries to OR.
   * @returns {DatabaseQuery}                The first query passed in, with the rest as OR SubQueries.
   */
  static or (queries) {
    return DatabaseQuery._compileQueries('or', queries)
  }

  /**
   * AND some queries together.
   * @static
   * @param   {Array<DatabaseQuery>} queries The queries to AND.
   * @returns {DatabaseQuery}                The first query passed in, with the rest as AND SubQueries.
   */
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

  /**
   * OR some queries to this query.
   * @param   {Array<DatabaseQuery>} queries The queries to OR.
   * @returns {this}                         The DatabaseQuery.
   */
  or (queries) {
    return this._addSubqueries('or', queries)
  }

  /**
   * AND some queries to this query.
   * @param   {Array<DatabaseQuery>} queries The queries to AND.
   * @returns {this}                         The DatabaseQuery.
   */
  and (queries) {
    return this._addSubqueries('and', queries)
  }

  /**
   * Add a limit condition.
   * @param   {number} num The number of results to return.
   * @returns {this}       The DatabaseQuery.
   */
  limit (num) {
    this.maxResults = num
    return this
  }

  /**
   * Add an equalTo condition.
   * @param   {string} prop The property to check.
   * @param   {any}    val  The value that the property's value must be equal to.
   * @returns {this}        The DatabaseQuery.
   */
  equalTo (prop, val) {
    return this._addCondition('equalTo', prop, val)
  }

  /**
   * Add a notEqualTo condition.
   * @param   {string} prop The property to check.
   * @param   {any}    val  The value that the property's value must not be equal to.
   * @returns {this}        The DatabaseQuery.
   */
  notEqualTo (prop, val) {
    return this._addCondition('notEqualTo', prop, val)
  }

  /**
   * Add a lessThan condition.
   * @param   {string} prop The property to check.
   * @param   {number} num  The number that the property's value must be less than.
   * @returns {this}        The DatabaseQuery.
   */
  lessThan (prop, num) {
    return this._addCondition('lessThan', prop, num)
  }

  /**
   * Add a greaterThan condition.
   * @param   {string} prop The property to check.
   * @param   {number} num  The number that the property's value must be greater than.
   * @returns {this}        The DatabaseQuery.
   */
  greaterThan (prop, num) {
    return this._addCondition('greaterThan', prop, num)
  }

  /**
   * Execute this query.
   * @returns {Promise<Array<DatabaseObject>>} The DatabaseObject records, if found.
   */
  find () {
    return this._dbm.find(this)
      .then((data) => {
        if (data && data.length > 0) {
          return data.map((json) => this._dbm.newObject(this.type, json, false))
        }

        return []
      })
  }

  /**
   * Execute this query searching for the given id.
   * @param   {string}                      id The ID to search for.
   * @returns {Promise<DatabaseObject|void>}    The DatabaseObject record, if found.
   */
  get (id) {
    this.getId = id
    return this._dbm.get(this)
      .then((json) => {
        if (json) {
          return this._dbm.newObject(this.type, json, false)
        }
      })
  }

  _addCondition (type, prop, value) {
    this.conditions[prop] = { type, value }
    return this
  }

  /**
   * Add subqueries to this query.
   * @private
   * @param   {SubQueryType}         type    The type of subquery to add.
   * @param   {Array<DatabaseQuery>} queries The queries to add.
   * @returns {this}                         The DatabaseQuery.
   */
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
 * @typedef {('and'|'or')} SubQueryType
 */

/**
 * @typedef  SubQuery
 * @property {SubQueryType}  type  The type of SubQuery.
 * @property {DatabaseQuery} query The SubQuery.
 */
