const fs = require('fs').promises
const path = require('path')

module.exports.print = (...input) => {
  process.stdout.write(input.join(' ') + '\n')
}

module.exports.copyFiles = async (parent, target) => {
  const files = await fs.readdir(parent)

  try {
    await fs.access(
      path.join(target, 'migrations')
    )
  } catch (error) {
    await fs.mkdir(
      path.join(target, 'migrations')
    )
  }

  for (const file of files) {
    try {
      await fs.copyFile(
        path.join(parent, file),
        path.join(target, 'migrations', file)
      )
    } catch (error) {
      this.print(
        `An error occurred running migrations, reason:\n${error}`
      )
    }
  }

  this.print('Copied files...')
}

module.exports.parseArgs = (rawArgs) => {
  const commandObject = rawArgs.slice(2)

  const command = commandObject[0]

  const commandArgs = commandObject.slice(1)

  return {
    command,
    args: commandArgs
  }
}
