const DatabaseObject = require('../database-object')
const DatabaseQuery = require('../database-query')

class DatabaseManager {
  /**
   * Class representing a database manager.
   * @param {DatabaseManagerOptions} options The DatabaseManagerOptions.
   */
  constructor ({
    DataQuery = (...args) => new DatabaseQuery(...args),
    DataObject = (...args) => new DatabaseObject(...args)
  } = {}) {
    /**
     * @type    {DatabaseQuery}
     * @private
     */
    this._queryBuilder = DataQuery
    /**
     * @type    {DatabaseObject}
     * @private
     */
    this._objectBuilder = DataObject
  }

  /**
   * Create a new DatabaseObject.
   * @param   {string}         type         The type of DatabaseObject to create.
   * @param   {any}            data         The data to initialize the DataObject with.
   * @param   {boolean}        [isNew=true] Whether or not the DatabaseObject should be treated as a new record.
   * @returns {DatabaseObject}              The new DatabaseObject.
   */
  newObject (type, data, isNew = true) {
    return this._objectBuilder(this, type, data, { isNew })
  }

  /**
   * Start a DatabaseQuery.
   * @param   {string}        type The type of DatabaseObject to query for.
   * @returns {DatabaseQuery}      The new DatabaseQuery.
   */
  newQuery (type) {
    return this._queryBuilder(this, type)
  }

  /**
   * Add a new DatabaseObject.
   * @param   {string}       type The type of DatabaseObject to add.
   * @param   {any}          data The raw data for the new DatabaseObject.
   * @returns {Promise<any>}      The new DatabaseObject (should not need to be saved).
   */
  async add (type, data) {
    throw Error('not yet implemented')
  }

  /**
   * Delete a DatabaseObject.
   * @param   {DatabaseObject} object The DatabaseObject to delete.
   * @returns {Promise<void>}
   */
  async delete (object) {
    throw Error('not yet implemented')
  }

  /**
   * Update a Database Object.
   * @param   {DatabaseObject} object The DatabaseObject to update.
   * @returns {Promise<any>}          The raw data of the DatabaseObject.
   */
  async update (object) {
    throw Error('not yet implemented')
  }

  /**
   * Execute a DatabaseQuery that can only return a single unique DataObject.
   * @param   {DatabaseQuery} query The DatabaseQuery to execute.
   * @returns {Promise<any>}        The raw data of the DatabaseObject.
   */
  async get (query) {
    throw Error('not yet implemented')
  }

  /**
   * Execute a DatabaseQuery.
   * @param   {DatabaseQuery}       query The DatabaseQuery to execute.
   * @returns {Promise<Array<any>>}       The raw data of the DatabaseObject(s).
   */
  async find (query) {
    throw Error('not yet implemented')
  }
}

module.exports = DatabaseManager

/**
 * @typedef  DatabaseManagerOptions
 * @property {Function(...any[]): DatabaseObject} DataObject DatabaseObject constructor to structure database values.
 * @property {Function(...any[]): DatabaseQuery}  DataQuery  DatabaseQuery constructor to structure database values.
 */
