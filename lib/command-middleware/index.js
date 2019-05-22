/**
 * Class representing a permission.
 */
class CommandMiddleware {
  /**
   * Create a permission.
   * @param {Object}        data                                     The permission data.
   * @param {String}        data.name                                The name of the permission.
   * @param {Number}        data.level                               The level of the permission (0 is the bottom).
   * @param {CheckFunction} [data.check=function () { return true }] A test to see if a member has this permission.
   */
  constructor (data) {
    const {
      reason,
      run
    } = data
    /**
     * @type {MiddlewareRun} A test to see if a member has this permission.
     */
    this.run = run
    /**
     * @type {String} Why this middleware would fail.
     */
    this.reason = reason
  }
}

/**
 * @typedef {function(CommandContext): boolean} MiddlewareRun
 */

module.exports = CommandMiddleware
