const fs = require('fs').promises

module.exports.print = (...input) => {
  process.stdout.write(input.join(' ') + '\n')
}

module.exports.copy = async (parent, target) => {
  const files = await fs.readdir(parent)

  for (const file of files) {
    try {
      const { isDirectory } = await fs.stat(`${parent}/${file}`)

      if (isDirectory()) {
        try {
          await fs.access(`${target}/${file}`)
        } catch (error) {
          await fs.mkdir(`${target}/${file}`)
        }

        await this.copy(`${parent}/${file}`, `${target}/${file}`)
      }

      await fs.copyFile(`${parent}/${file}`, `${target}/${file}`)
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
