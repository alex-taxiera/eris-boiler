const path = require('path')
const fs = require('fs')

const {
  exec
} = require('child_process')

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
        `An error occurred running migrations, reason:\n${err}\n`
      )
      process.exit(1)
    } else {
      process.stdout.write('Generating "knexfile.js"\n')
      process.stdout.write('Pulling migrations...\n')

      const templateDir = path.join(__dirname, 'template', 'migrations')
      const userDir = path.join(process.cwd(), 'migrations')

      copy(templateDir, userDir)
    }
  })
}

module.exports.runSql = (params) => {
  if (params[0] === '--down') {
    process.stdout.write(`Running down migrations...\n`)

    exec(`npx knex migrate:rollback ${params.slice(1).join(' ')}`.trim(), (err, stdout, stderr) => {
      if (err) {
        process.stderr.write(
          `An error occurred running migrations, reason:\n${err}\n`
        )
        process.exit(1)
      } else {
        process.stdout.write(`${stdout}\n`)
      }
    })
  } else {
    process.stdout.write(`Running migrations...\n`)

    exec('npx knex migrate:latest', (err, stdout, stderr) => {
      if (err) {
        process.stderr.write(
          `An error occurred running migrations, reason:\n${err}\n`
        )
        process.exit(1)
      } else {
        process.stdout.write(`${stdout}\n`)
      }
    })
  }
}

module.exports.unknownCmd = () => {
  process.stderr.write(`Unknown command...\n`)
  process.exit(1)
}
