const color = require('colors')
const path = require('path')
const ncp = require('ncp')

const { exec } = require('child_process')

module.exports.initSql = () => {
  process.stdout.write(color.green('Pulling migrations...\n'))

  const templateDir = path.join(__dirname, 'template')
  const userDir = process.cwd()

  ncp(templateDir, userDir, (err) => {
    if (err) {
      process.stderr.write(
        color.red(`An error transferring files, reason:\n${err}`)
      )
      process.exit(1)
    } else {
      process.stdout.write(color.green(`Files transferred...\n`))
      process.exit(0)
    }
  })
}

module.exports.runSql = () => {
  process.stdout.write(`Running migrations...\n`)

  exec('npx knex migrate:latest', (err, stdout, stderr) => {
    if (err) {
      process.stderr.write(
        color.red(`An error occurred running migrations, reason:\n${err}`)
      )
      process.exit(1)
    } else {
      process.stdout.write(color.green(stdout))
    }
  })
}

module.exports.unknownCmd = () => {
  process.stderr.write(color.red(`Unknown command...\n`))
  process.exit(1)
}
