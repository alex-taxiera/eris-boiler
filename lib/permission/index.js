const CommandMiddleware = require('../command-middleware')

/**
 * Class representing a permission.
 */
class Permission extends CommandMiddleware {
  /**
   * Create a permission.
   * @param {Object}        data                                     The permission data.
   * @param {String}        data.name                                The name of the permission.
   * @param {Number}        data.level                               The level of the permission (0 is the bottom).
   * @param {CheckFunction} [data.check=function () { return true }] A test to see if a member has this permission.
   */
  constructor (data) {
    super(data)
    this.reason = 'You do not have the required permissions.'
  }
}

/**
 * @typedef {function(GuildMember, DataClient): boolean} CheckFunction
 */

module.exports = Permission
