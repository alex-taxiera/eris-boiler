const DatabaseObject = require('../database-object')
const DatabaseQuery = require('../database-query')

/**
 * Class representing a database manager.
 */
class DatabaseManager {
  /**
   * Create a DatabaseManager.
   * @param {DatabaseManagerOptions} options The DatabaseManagerOptions.
   */
  constructor ({
    DataQuery = DatabaseQuery,
    DataObject = DatabaseObject
  } = {}) {
    /**
     * @type    {DatabaseQuery} DatabaseQuery constructor to structure database values.
     * @private
     */
    this._DataQuery = DataQuery
    /**
     * @type    {DatabaseObject} DataObject DatabaseObject constructor to structure database values.
     * @private
     */
    this._DataObject = DataObject
  }

  /**
   * Convert raw object to DataObject.
   * @param  {String}         type The type of DatabaseObject.
   * @param  {Object}         data The raw data of the DatabaseObject.
   * @return {DatabaseObject}      The new DatabaseObject.
   */
  jsonToObject (type, data) {
    return new this._DataObject({
      databaseManager: this,
      type,
      data
    })
  }

  /**
   * Start a DatabaseQuery.
   * @param  {String}        type The type of DatabaseObject to query for.
   * @return {DatabaseQuery}      The new DatabaseQuery.
   */
  query (type) {
    return new this._DataQuery({ databaseManager: this, type })
  }

  /**
   * Add a new DatabaseObject.
   * @param  {String}                  type The type of DatabaseObject to add.
   * @param  {Object}                  data The raw data for the new DatabaseObject.
   * @return {Promise<DatabaseObject>}      The new DatabaseObject (should not need to be saved).
   */
  async add (type, data) {
    throw Error('not yet implemented')
  }

  /**
   * Delete a DatabaseObject.
   * @param  {DatabaseObject} object The DatabaseObject to delete.
   * @return {Promise}
   */
  async delete (object) {
    throw Error('not yet implemented')
  }

  /**
   * Update a Database Object.
   * @param  {DatabaseObject}  object The DatabaseObject to update.
   * @return {Promise<Object>}        The raw data of the DatabaseObject.
   */
  async update (object) {
    throw Error('not yet implemented')
  }

  /**
   * Execute a DatabaseQuery that can only return a single unique DataObject.
   * @param  {DatabaseQuery}   query The DatabaseQuery to execute.
   * @return {Promise<Object>}       The raw data of the DatabaseObject.
   */
  async get (query) {
    throw Error('not yet implemented')
  }

  /**
   * Execute a DatabaseQuery.
   * @param  {DatabaseQuery}     query The DatabaseQuery to execute.
   * @return {Promise<Object[]>}       The raw data of the DatabaseObject(s).
   */
  async find (query) {
    throw Error('not yet implemented')
  }
}

module.exports = DatabaseManager

/**
 * @typedef  {Object}         DatabaseManagerOptions
 * @property {DatabaseObject} DataObject DatabaseObject constructor to structure database values.
 * @property {DatabaseQuery}  DataQuery  DatabaseQuery constructor to structure database values.
 */
