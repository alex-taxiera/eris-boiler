const { runSql, initSql, unknownCmd } = require('./actions')

const processCommand = (params) => {
  switch (params[0]) {
    case 'init-sql':
      initSql()
      break
    case 'run-sql':
      runSql()
      break
    default:
      unknownCmd()
      break
  }
}

module.exports = async (args) => processCommand(args.slice(2))
