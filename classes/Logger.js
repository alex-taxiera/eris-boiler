const moment = require('moment')
const colors = require('colors')

/**
 * Class representing a logger.
 */
class Logger {
  /**
   * Log something.
   * @param {String} str             The string to log (can also be something with a toString method).
   * @param {String} [color='white'] The color that the message should be in.
   */
  log (str, color = 'white') {
    if (typeof str !== 'string') str = str.toString()
    console.log(colors.gray(`${moment().format('MM/DD HH:mm:ss')}`) + ' | ' +
    colors[color](`BZZT ${str.toUpperCase()} BZZT`))
  }
  /**
   * Log something in green for success.
   * @param {String} str The string to log (can also be something with a toString method).
   */
  success (str) {
    this.log(str, 'green')
  }
  /**
   * Log something in yellow for warning.
   * @param {String} str The string to log (can also be something with a toString method).
   */
  warn (str) {
    this.log(str, 'yellow')
  }
  /**
   * Log something in red for error.
   * @param {String} err The string to log (can also be something with a toString method).
   */
  error (err) {
    this.log(err, 'red')
  }
}

module.exports = Logger
