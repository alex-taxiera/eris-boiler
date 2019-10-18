// const arg = require('arg')
// const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const {
  promisify
} = require('util')

// const access = promisify(fs.access)
const copy = promisify(require('ncp'))

const copyFiles = () => {
  console.log(path.join(__dirname, 'template'))
  console.log(process.cwd())

  return copy(path.join(__dirname, 'template'), process.cwd(), {
    clobber: false
  })
}

const createProject = async () => {
  process.stdout.write('Copying files...\n')

  try {
    await copyFiles()
  } catch (error) {
    process.stderr.write(`Failed to copy files:\n${error}\n`)
    return false
  }

  process.stdout.write('Copied template files...\n')
  return true
}

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
