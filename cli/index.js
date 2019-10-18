const path = require('path')
const ncp = require('ncp')

module.exports = async (args) => {
  const templateDir = path.join(__dirname, 'template')
  const userDir = process.cwd()

  ncp(templateDir, userDir, (err) => {
    if (err) {
      process.stderr.write(err.toString())
      return process.exit(1)
    }

    process.stdout.write('Wrote files')
    process.exit(0)
  })
}
