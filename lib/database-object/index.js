/**
 * Class representing a database object.
 */
class DatabaseObject {
  /**
   * Create a DatabaseObject.
   * @param {DatabaseObjectOptions} options The DatabaseObjectOptions.
   */
  constructor (databaseManager, type, data = {}, { isNew = false } = {}) {
    /**
     * @type {DatabaseManager}
     */
    this._dbm = databaseManager
    /**
     * @type {String} The type of DatabaseObject.
     */
    this.type = type
    /**
     * @type {String} The id of the DatabaseObject.
     */
    this.id = data.id
    /**
     * @type    {Object} The raw data of the DatabaseObject.
     * @private
     */
    this._data = data
    /**
     * @type    {Boolean} Whether or not the DatabaseObject has unsaved changes.
     * @private
     */
    this._saveNeeded = isNew
    /**
     * @type    {boolean} Whether or not this object is not in the database already.
     * @private
     */
    this._isNew = isNew
  }

  get (prop) {
    this._errorIfNoProp(prop)
    return this._data[prop]
  }

  set (prop, val) {
    this._errorIfNoProp(prop)
    if (this._data[prop] !== val) {
      this._data[prop] = val
      this._saveNeeded = true
    }
    return this
  }

  toJSON () {
    return Object.assign({ objectType: this.type }, this._data)
  }

  delete () {
    return this._dbm.delete(this)
  }

  async save (data) {
    for (const [ key, val ] of Object.entries(data)) {
      this.set(key, val)
    }

    if (this._saveNeeded) {
      Object.assign(
        this,
        await (
          this._isNew ? this._dbm.add(this.type, this) : this._dbm.update(this)
        ).then((json) => this._dbm.newObject(this.type, json, false)) // sets this as a new DatabaseObject with the updated details
      )
      // don't bother setting the boolean flags after as they will be at defaults.
    }
    return this
  }

  _errorIfNoProp (prop) {
    if (!this._data.hasOwnProperty(prop)) {
      throw Error(`Object of type ${this.type} has no prop named: ${prop}`)
    }
  }
}

module.exports = DatabaseObject
