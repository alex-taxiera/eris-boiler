const format = require('dateformat')
const colors = require('colors/safe')

function log (content = '', color = 'white') {
  const time = format(Date.now(), 'mm/dd HH:MM:ss')
  console.log(colors.gray(time) + ' | ' + colors[color](content))
}

function success (content = '') {
  log(content, 'green')
}

function warn (content = '') {
  log(content, 'yellow')
}

function error (content = '') {
  log(content, 'red')
}

module.exports = {
  log,
  success,
  warn,
  error
}
