const CommandMiddleware = require('../command-middleware')

/**
 * Class representing a permission.
 */
class Permission extends CommandMiddleware {
  /**
   * Create a permission.
   * @param {Object}        data                                                      The permission data.
   * @param {Number}        [data.level=0]                                             The level of the permission (0 is the bottom).
   * @param {String}        [data.reason='You do not have the required permissions.'] A message when a user does not meet the permission level.
   * @param {CheckFunction} [data.run=function () { return true }]                    A test to see if a member has this permission.
   */
  constructor (data) {
    const {
      level = 0,
      reason = 'You do not have the required permissions.',
      run = () => true
    } = data
    super({ run })
    this.reason = reason
    this.level = level
  }
}

/**
 * @typedef {function(GuildMember, DataClient): boolean} CheckFunction
 */

module.exports = Permission
