const DatabaseManager = require('../database-manager')

/**
 * Class representing a database manager.
 */
class RAMManager extends DatabaseManager {
  constructor (DataQuery, DataObject, options) {
    super(DataQuery, DataObject)
    /**
     * @type    {Map<String, Map<String, DatabaseObject>>} Volatile data store.
     * @private
     */
    this._store = new Map()
    /**
     * @type    {Map<String, Number>} ID helper.
     * @private
     */
    this._idCount = new Map()
  }

  _addStoreIfNeeded (type) {
    if (!this._store.get(type)) {
      this._store.set(type, new Map())
      this._idCount.set(type, 0)
    }
  }

  async get (query) {
    this._addStoreIfNeeded(query.type)
    return this._store.get(query.type).get(query.getId)
  }

  async find (query) {
    this._addStoreIfNeeded(query.type)
    return [ ...this._store.get(query.type).values() ]
  }

  async add (type, data) {
    this._addStoreIfNeeded(type)
    const id = this._idCount.get(type) + 1
    this._idCount.set(type, id)

    this._store.get(type).set(id, data)
    return this._store.get(type).get(id)
  }

  async delete (object) {
    this._addStoreIfNeeded(object.type)
    this._store.get(object.type).delete(object.id)
  }

  async update (object) {
    this._addStoreIfNeeded(object.type)
    if (!this._store.get(object.type).get(object.id)) {
      throw Error('entry does not exist')
    }
    this._store.get(object.type).set(object.id, object._data)
    return this._store.get(object.type).get(object.id)
  }
}

module.exports = RAMManager
