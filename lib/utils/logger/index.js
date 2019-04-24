const format = require('dateformat')
const colors = require('colors/safe')

function log (color = 'white', content = '') {
  const time = format(Date.now(), 'mm/dd HH:MM:ss')
  console.log(colors.gray(time) + ' | ' + colors[color](content))
}

function success (content = '') {
  log('green', content)
}

function warn (content = '') {
  log('yellow', content)
}

function error (content = '') {
  log('red', content)
}

module.exports = {
  log,
  success,
  warn,
  error
}
