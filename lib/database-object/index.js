/**
 * Class representing a database object.
 */
class DatabaseObject {
  /**
   * Create a DatabaseObject.
   * @param {DatabaseObjectOptions} options The DatabaseObjectOptions.
   */
  constructor ({ databaseManager, type, data }) {
    /**
     * @type {DatabaseManager}
     */
    this._manager = databaseManager
    /**
     * @type {String} The type of DatabaseObject.
     */
    this.type = type
    /**
     * @type {String} The id of the DatabaseObject.
     */
    this.id = data.objectId
    /**
     * @type    {Object} The raw data of the DatabaseObject.
     * @private
     */
    this._data = data
    /**
     * @type    {Boolean} Whether or not the DatabaseObject has unsaved changes.
     * @private
     */
    this._saveNeeded = false
  }

  get (prop) {
    return this._data[prop]
  }

  set (prop, val) {
    if (this._data[prop] && this._data[prop] !== val) {
      this._data[prop] = val
      this._saveNeeded = true
    }
    return this
  }

  toJSON () {
    return Object.assign({
      objectType: this.type
    }, this._data)
  }

  isEqual (object) {
    try {
      const thisKeys = Object.keys(this._data)
      if (thisKeys.length !== Object.keys(object._data).length) {
        return false
      }
      for (const key of thisKeys) {
        if (!object._data[key] || object._data[key] !== this._data[key]) {
          return false
        }
      }
    } catch (e) {
      return false
    }
    return true
  }

  delete () {
    return this._manager.delete(this)
  }

  async save (data) {
    for (const [key, val] of Object.entries(data)) {
      this.set(key, val)
    }

    if (this._saveNeeded) {
      Object.assign(
        this,
        await this._manager.update(this)
          .then((json) => this._manager.jsonToObject(this.type, json))
      )
      this._saveNeeded = false
    }
    return this
  }
}

module.exports = DatabaseObject
