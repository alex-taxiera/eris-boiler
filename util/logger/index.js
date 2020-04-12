const format = require('dateformat')
const chalk = require('chalk')

const log = module.exports.log = (content = [], color = 'white') => {
  if (!Array.isArray(content)) {
    content = [ content ]
  }
  const time = format(Date.now(), 'mm/dd HH:MM:ss')
  const log = [
    chalk.gray(time),
    '|',
    ...content.map((str) => chalk[color](str))
  ]
  // eslint-disable-next-line no-console
  console.log(...log)
  return log
}

module.exports.success = (...content) => log(content, 'green')
module.exports.warn = (...content) => log(content, 'yellow')
module.exports.error = (...content) => log(content, 'red')
module.exports.info = (...content) => log(content, 'cyan')
