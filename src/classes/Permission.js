/**
 * Class representing a permission.
 */
class Permission {
  /**
   * Create a permission.
   * @param {Object}   data                                     The permission data.
   * @param {String}   data.name                                The name of the permission.
   * @param {Number}   data.level                               The level of the permission (0 is the bottom).
   * @param {Function} [data.check=function () { return true }] A test to see if a member has this permission.
   */
  constructor (data) {
    const { name, level, check } = data
    if (typeof name !== 'string') throw Error(`permission cannot have name ${name}`)
    if (isNaN(level)) throw Error(`permission cannot have level ${level}`)
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
    this.check = typeof check === 'function' ? check : function () { return true }
  }
  /**
   * Denial message telling the user what level permission they need.
   * @return {String} Denial message including permission name.
   */
  deny () {
    return `Must be ${this.name}!`
  }
}

module.exports = Permission
