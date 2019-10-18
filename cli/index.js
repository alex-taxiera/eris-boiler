// const arg = require('arg')
const createProject = require('./main.js')
// const inquirer = require('inquirer')

// const parseArgs = (rawArgs) => {
//   const args = arg(
//     {
//       '--yes': Boolean,
//       '-y': '--yes'
//     },
//     {
//       argv: rawArgs.slice(2)
//     }
//   )

//   return {
//     skipPrompt: args['--yes'] || true
//   }
// }

// const runPrompt = async (opts) => {
//   if (opts.skipPrompt) {
//     return {
//       ...opts
//     }
//   }
// }

module.exports = async (args) => {
  // let options = parseArgs(args)

  // options = await runPrompt(options)

  if (createProject()) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}
