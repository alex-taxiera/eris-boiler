/**
 * Class factory with type checking.
 */
class SafeClass {
  /**
   * Create a SafeClass
   * @param {Object} [mandatoryTypes={}] Object mapping property name to type string.
   * @param {Object} [restraints={}]     Object mapping property name to a Map of allowed values.
   */
  constructor (mandatoryTypes = {}, restraints = {}) {
    /**
     * The types to conform to.
     * @private
     * @type    {Object}
     */
    this._mandatoryTypes = mandatoryTypes
    /**
     * The values to conform to.
     * @private
     * @type    {Object}
     */
    this._restraints = restraints
  }
  /**
   * Verify data types and restraints.
   * @private
   * @throws  {TypeError} Error message is all exceptions raised with types or restraints.
   */
  _checkDataTypes () {
    const errors = []
    for (const key in this._mandatoryTypes) {
      let expected = this._mandatoryTypes[key]
      let actual = typeof this[key]
      if (expected.endsWith('[]')) {
        actual = typeof this[key][0] + '[]'
        if (!Array.isArray(this[key]) || (this[key].length > 0 && actual !== expected)) errors.push(this._typeError(key, expected, actual))
      } else if (actual !== expected) errors.push(this._typeError(key, expected, actual))
      if (this._restraints[key]) {
        expected = this._restraints[key]
        actual = this[key]
        if (!expected.has(actual)) errors.push(this._restraintError(key, expected, actual))
      }
    }
    if (errors.length !== 0) throw TypeError(errors.join('\n'))
  }
  /**
   * Build a restraint error message.
   * @private
   * @param   {String} key      Property name which has an invalid value.
   * @param   {Map}    expected Map of allowed values.
   * @param   {*}      actual   Whatever the invalid value is.
   * @return  {String}          Error message.
   */
  _restraintError (key, expected, actual) {
    const keys = []
    const iter = expected.keys()
    let name = iter.next().value
    while (name) {
      keys.push(name)
      name = iter.next().value
    }
    return `"${key}" expects one of [${keys.join(', ')}] but was given "${actual}"`
  }
  /**
   * Build a type error message.
   * @private
   * @param   {String} key      Property name which has an invalid type.
   * @param   {String} expected Type that was expected.
   * @param   {String} actual   Whatever the invalid type is.
   * @return  {String}          Error message.
   */
  _typeError (key, expected, actual) {
    return `"${key}" expects type "${expected}" but was given type "${actual}"`
  }
}

module.exports = SafeClass
