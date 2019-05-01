/**
 * Class representing a permission.
 */
class Permission {
  /**
   * Create a permission.
   * @param {Object}        data                                     The permission data.
   * @param {String}        data.name                                The name of the permission.
   * @param {Number}        data.level                               The level of the permission (0 is the bottom).
   * @param {CheckFunction} [data.check=function () { return true }] A test to see if a member has this permission.
   */
  constructor (data) {
    const {
      name,
      level,
      check = () => true
    } = data
    /**
     * @type {String} The name of the permission.
     */
    this.name = name
    /**
     * @type {String} The level of the permission (lower number means less permission).
     */
    this.level = level
    /**
     * @type {CheckFunction} A test to see if a member has this permission.
     */
    this.check = check
  }

  /**
   * Denial message telling the user what level permission they need.
   * @return {String} Denial message including permission name and level.
   */
  get deny () {
    return `Must be at least ${this.name}! (level ${this.level})`
  }
}

/**
 * @typedef {function(GuildMember, DataClient): boolean} CheckFunction
 */

module.exports = Permission
