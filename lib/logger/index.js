const format = require('dateformat')
const colors = require('colors/safe')

function log (color = 'white', content) {
  const time = format(Date.now(), 'mm/dd HH:MM:ss')
  console.log(colors.gray(time) + ' | ' + colors[color](content))
}

module.exports = {
  log,
  success: log.bind(null, 'green'),
  warn: log.bind(null, 'yellow'),
  error: log.bind(null, 'red')
}
