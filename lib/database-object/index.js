class DatabaseObject {
  /**
   * Class representing a database object.
   * @param {DatabaseManager}       databaseManager The DatabaseManager.
   * @param {string}                type            The type of this DatabaseObject.
   * @param {any}                   [data={}]       The data to initialize this DataObject with.
   * @param {DatabaseObjectOptions} [options={}]    The DatabaseObjectOptions.
   */
  constructor (databaseManager, type, data = {}, { isNew = false } = {}) {
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
     * @type {string}
     */
    this.id = data.id
    /**
     * @type    {any}
     * @private
     */
    this._data = data
    /**
     * @type    {boolean}
     * @private
     */
    this._saveNeeded = isNew
    /**
     * @type    {boolean}
     * @private
     */
    this._isNew = isNew
  }

  /**
   * Get a value from the DatabaseObject.
   * @param   {string} prop The name of the prop.
   * @returns {any}         The value of the prop.
   */
  get (prop) {
    return this._data[prop]
  }

  /**
   * Set a value of the DatabaseObject.
   * @param   {string}         prop The name of the prop.
   * @param   {any}            val  The value to set.
   * @returns {DatabaseObject}      The DatabaseObject.
   */
  set (prop, val) {
    if (this._data[prop] !== val) {
      this._data[prop] = val
      this._saveNeeded = true
    }
    return this
  }

  /**
   * Get a simple object representation of the DatabaseObject.
   * @returns {any} The DatabaseObject as a normal object.
   */
  toJSON () {
    return Object.assign({ objectType: this.type }, this._data)
  }

  /**
   * Delete this DatabaseObject record.
   * @returns {Promise<void>}
   */
  delete () {
    return this._dbm.delete(this._data)
  }

  /**
   * Save the DatabaseObject record.
   * @param   {any}                     data Any new data to write to the DatabaseObject before saving.
   * @returns {Promise<DatabaseObject>}      The DatabaseObject.
   */
  async save (data) {
    for (const [ key, val ] of Object.entries(data || {})) {
      this.set(key, val)
    }

    if (this._saveNeeded) {
      Object.assign(
        this,
        await (
          this._isNew
            ? this._dbm.add(this.type, this._data)
            : this._dbm.update(this)
        ).then((json) => this._dbm.newObject(this.type, json, false)) // sets this as a new DatabaseObject with the updated details
      )
      // don't bother setting the boolean flags after as they will be at defaults.
    }
    return this
  }
}

module.exports = DatabaseObject

/**
 * @typedef  DatabaseObjectOptions
 * @property {boolean} [isNew=false] Whether or not to treat this as a new record.
 */
