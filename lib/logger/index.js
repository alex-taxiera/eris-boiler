const format = require('dateformat')
const colors = require('colors/safe')

/**
 * Class representing a logger.
 */
class Logger {
  constructor () {
    // binding to ensure the this context is always correct
    this.success = this.success.bind(this)
    this.warn = this.warn.bind(this)
    this.error = this.error.bind(this)
  }
  /**
   * Log something in red for error.
   * @param {String} error The string to log (can also be something with a toString method).
   */
  error (error) {
    error = error.stack || error
    this.log(error, 'red')
  }
  /**
   * Log something.
   * @param {String} content         The string to log (can also be something with a toString method).
   * @param {String} [color='white'] The color that the message should be in.
   */
  log (content, color = 'white') {
    const time = format(Date.now(), 'mm/dd HH:MM:ss')
    console.log(colors.gray(time) + ' | ' + colors[color](content))
  }
  /**
   * Log something in green for success.
   * @param {String} content The string to log (can also be something with a toString method).
   */
  success (content) {
    this.log(content, 'green')
  }
  /**
   * Log something in yellow for warning.
   * @param {String} content The string to log (can also be something with a toString method).
   */
  warn (content) {
    this.log(content, 'yellow')
  }
}

module.exports = Logger
