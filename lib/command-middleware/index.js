/**
 * Class representing a permission.
 */
class CommandMiddleware {
  /**
   * Create a permission.
   * @param {Object}        data     The middleware data.
   * @param {CheckFunction} data.run The middleware runner.
   */
  constructor (data) {
    const {
      run = async () => null
    } = data
    /**
     * @type {MiddlewareRun} A Function to run before executing a command.
     */
    this.run = run
  }
}

/**
 * @typedef {function(CommandContext): void} MiddlewareRun
 */

module.exports = CommandMiddleware
