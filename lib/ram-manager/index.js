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

  async _get (query) {
    const {
      type,
      getId
    } = query
    this._addStoreIfNeeded(type)
    return this.jsonToObject(type, this._store.get(type).get(getId))
  }

  async _find (query) {
    this._addStoreIfNeeded(query.type)
    return [...this._store.get(query.type).values]
  }

  async add (type, data) {
    this._addStoreIfNeeded(type)
    const id = this._idCount.get(type) + 1; this._idCount.set(type, id)
    this._store.get(type).set(id, data)
    return this.jsonToObject(type, this._store.get(type).get(id))
  }

  async delete (object) {
    this._addStoreIfNeeded(object.type)
    this._store.get(object.type).delete(object.id)
  }

  async update (object) {
    const {
      type,
      id,
      _data
    } = object
    this._addStoreIfNeeded(type)
    if (!this._store.get(type).get(id)) {
      throw Error('entry does not exist')
    }
    this._store.get(type).set(id, _data)
    return this.jsonToObject(type, this._store.get(type).get(id))
  }
}

module.exports = RAMManager
