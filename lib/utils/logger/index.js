const format = require('dateformat')
const colors = require('colors/safe')

module.exports = {
  log: (content = '', color = 'white') => {
    const time = format(Date.now(), 'mm/dd HH:MM:ss')
    const log = colors.gray(time) + ' | ' + colors[color](content)
    console.log(log)
    return log
  },
  success: (content = '') => {
    return module.exports.log(content, 'green')
  },
  warn: (content = '') => {
    return module.exports.log(content, 'yellow')
  },
  error: (content = '') => {
    return module.exports.log(content, 'red')
  }
}
