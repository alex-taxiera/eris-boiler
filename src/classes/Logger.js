const moment = require('moment')
const colors = require('colors/safe')

/**
 * Class representing a logger.
 */
class Logger {
  /**
   * Log something.
   * @param {String} content         The string to log (can also be something with a toString method).
   * @param {String} [color='white'] The color that the message should be in.
   */
  log (content, color = 'white') {
    const time = moment().format('MM/DD HH:mm:ss')
    console.log(colors.gray(time) + ' | ' + colors[color](content))
  }
  /**
   * Log something in green for success.
   * @param {String} content The string to log (can also be something with a toString method).
   */
  success (content) {
    const time = moment().format('MM/DD HH:mm:ss')
    console.log(colors.gray(time) + ' | ' + colors.green(content))
  }
  /**
   * Log something in yellow for warning.
   * @param {String} content The string to log (can also be something with a toString method).
   */
  warn (content) {
    const time = moment().format('MM/DD HH:mm:ss')
    console.log(colors.gray(time) + ' | ' + colors.yellow(content))
  }
  /**
   * Log something in red for error.
   * @param {String} error The string to log (can also be something with a toString method).
   */
  error (error) {
    if (error.stack) error = error.stack
    const time = moment().format('MM/DD HH:mm:ss')
    console.log(colors.gray(time) + ' | ' + colors.red(error))
  }
}

module.exports = Logger
