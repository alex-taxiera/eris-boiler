const arg = require('arg')
const inquirer = require('inquirer')

const parseArgsToOpts = (rawArgs) => {
  const args = arg(
    {
      '--init-sql': Boolean
    },
    {
      argv: rawArgs.slice(2)
    }
  )

  return {
    initSql: args['--init-sql'] || false
  }
}

const missingOpts = async (opts) => {
  const questions = []
  if (!opts.initSql) {
    questions.push({
      type: 'init',
      name: 'initSql',
      message: 'Try running "eris-boiler --init-sql"',
      default: true
    })
  }

  const answers = await inquirer.prompt(questions)
  return {
    ...opts,
    initSql: opts.initSql || answers.initSql
  }
}

const runKnexMigrations = () => {
  const { exec } = require('child_process')

  exec('npm run migrate:run', (err, out, error) => {
    if (err || error) {
      return process.stderr.write(err || error)
    }

    process.stdout.write('\nRunning migrations!!!\n')
    process.stdout.write(out)
  })
}

module.exports = async (args) => {
  let options = parseArgsToOpts(args)

  options = await missingOpts(options)

  if (options.initSql) {
    return runKnexMigrations()
  } else {
    return process.exit()
  }
}
