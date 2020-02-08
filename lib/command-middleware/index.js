class CommandMiddleware {
  /**
   * Class reprsenting command middleware.
   * @param {CommandMiddlewareData} data The middleware data.
   */
  constructor (data) {
    const {
      run = async () => null,
      failMessage = ''
    } = data
    /**
     * @type {string}
     */
    this.failMessage = failMessage
    /**
     * @type {MiddlewareRun}
     */
    this.run = run
  }
}

/**
 * @typedef  CommandMiddlewareData
 * @property {string}        [failMessage='']       A message to send if the middleware fails.
 * @property {MiddlewareRun} [run=async () => null] The middleware runner.
 */

/**
 * @callback MiddlewareRun
 * @param    {DataClient}     bot     The DataClient.
 * @param    {CommandContext} context The CommandContext.
 * @returns  {Promise<unknown>|unknown}
 */

module.exports = CommandMiddleware
