const CommandMiddleware = require('../command-middleware')

class Permission extends CommandMiddleware {
  /**
   * Class representing a permission.
   * @extends {CommandMiddleware}
   * @param   {PermissionData}    data                                                      The permission data.
   */
  constructor (data) {
    const {
      level = 0,
      failMessage = 'You do not have the required permissions.',
      run = () => true
    } = data
    super({ run, failMessage })
    this.level = level
  }
}

module.exports = Permission

/**
 * @typedef  PermissionData
 * @property {number}        [level=0] The level of the permission (0 is the bottom).
 * @property {string}        [reason='You do not have the required permissions.'] A message when a user does not meet the permission level.
 * @property {MiddlewareRun} [run=() => { return true }] A test to see if a member has this permission.
 */
