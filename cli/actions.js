const color = require('colors')
const path = require('path')
const fs = require('fs')

const { exec } = require('child_process')

const copy = (dirone, dirtwo) => {
  const files = fs.readdirSync(dirone)

  for (const file of files) {
    fs.createReadStream(`${dirone}/${file}`)
      .pipe(fs.createWriteStream(`${dirtwo}/${file}`))
  }
}

module.exports.initSql = () => {
  exec('npx knex init', (err, stdout, stderr) => {
    if (err) {
      process.stderr.write(
        color.red(err)
      )
      process.exit(1)
    } else {
      process.stdout.write(color.yellow('Generating "knexfile.js"'))
      process.stdout.write(color.green('Pulling migrations...\n'))

      const templateDir = path.join(__dirname, 'template', 'migrations')
      const userDir = path.join(process.cwd(), 'migrations')

      copy(templateDir, userDir)
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
