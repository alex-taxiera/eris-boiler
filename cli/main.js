const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

// const access = promisify(fs.access)
const copy = promisify(fs.copyFile)

const copyFiles = () => {
  return copy(path.join(__dirname, 'template'), process.cwd(), {
    clobber: false
  })
}

module.exports = async () => {
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
