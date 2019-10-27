const fs = require('fs').promises

module.exports.print = (...input) => {
  process.stdout.write(input.join(' ') + '\n')
}

module.exports.copy = async (parent, target) => {
  const files = await fs.readdir(parent)

  for (const file of files) {
    try {
      await fs.copyFile(`${parent}/${file}`, `${target}/${file}`)
      this.print('Copied files...')
    } catch (error) {
      this.print(
        `An error occurred running migrations, reason:\n${error}`
      )
    }
  }
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
