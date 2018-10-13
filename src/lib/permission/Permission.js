/**
 * Class representing a permission.
 * @extends {SafeClass}
 */
class Permission extends require('../safe-class') {
  /**
   * Create a permission.
   * @param {Object}   data                                     The permission data.
   * @param {String}   data.name                                The name of the permission.
   * @param {Number}   data.level                               The level of the permission (0 is the bottom).
   * @param {Function} [data.check=function () { return true }] A test to see if a member has this permission.
   */
  constructor (data) {
    const mandatoryTypes = {
      name: 'string',
      level: 'number',
      check: 'function'
    }
    super(mandatoryTypes)
    const {
      name,
      level,
      check
    } = data
    /**
     * The name of the permission.
     * @type {String}
     */
    this.name = name
    /**
     * The level of the permission (0 is the bottom).
     * @type {String}
     */
    this.level = level
    /**
     * A test to see if a member has this permission.
     * @type {Function}
     */
    this.check = check || function () { return true }

    this._checkDataTypes()
  }
  /**
   * Denial message telling the user what level permission they need.
   * @return {String} Denial message including permission name.
   */
  get deny () {
    return `Must be ${this.name}!`
  }
}

module.exports = Permission
