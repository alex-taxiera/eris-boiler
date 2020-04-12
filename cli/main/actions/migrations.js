const { exec } = require('child_process')
const { resolve } = require('path')

const { Action } = require('.')

const { print } = require('../functions')
const { copyFiles } = require('../functions')

class Migrations extends Action {
  constructor () {
    super({
      name: 'migrations',
      subActions: [
        new Action({
          name: 'generate',
          async run (params) {
            const migration = params.slice(1)[0]

            exec(`npx knex migrate:make ${migration}`,
              (error, stdout, stderr) => {
                if (error) {
                  throw error
                } else {
                  print(stdout)
                }
              })
          }
        }),
        new Action({
          name: 'up',
          async run (params) {
            const migration = params.slice(1)[0]

            exec(`npx knex migrate:up ${migration}`
              , (error, stdout, stderr) => {
                if (error) {
                  throw error
                } else {
                  print(stdout)
                }
              })
          }
        }),
        new Action({
          name: 'down',
          async run (params) {
            const migration = params.slice(1)[0]

            exec(`npx knex migrate:down ${migration}`
              , (error, stdout, stderr) => {
                if (error) {
                  throw error
                } else {
                  print(stdout)
                }
              })
          }
        }),
        new Action({
          name: 'rollback',
          async run (params) {
            const options = params.slice(1)

            if (options.includes('--all')) {
              print('Rolling back all latest migrations')
            } else {
              print('Rolling back latest migration')
            }

            exec(`npx knex migrate:rollback ${options.join(' ')}`,
              (err, stdout, stderr) => {
                if (err) {
                  throw err
                } else {
                  print('Rolled back migration(s)')
                }
              })
          }
        }),
        new Action({
          name: 'latest',
          async run () {
            print('Running all latest migrations')

            exec('npx knex migrate:latest', (err, stdout, stderr) => {
              if (err) {
                throw err
              } else {
                print('Ran latest migrations')
              }
            })
          }
        }),
        new Action({
          name: 'update',
          async run () {
            print('Importing the default migrations...')

            const templateDir = resolve(__dirname, '..', 'migrations')
            const userDir = resolve(process.cwd())

            await copyFiles(templateDir, userDir)

            print('Copied over all built in migrations')
          }
        })
      ],
      async run () {
        print('Importing the default migrations...')

        const templateDir = resolve(__dirname, '..', 'migrations')
        const userDir = resolve(process.cwd())

        await copyFiles(templateDir, userDir)
        print('Creating a knexfile...\n')

        exec('npx knex init', (err, stdout, stderr) => {
          if (err) {
            throw err
          } else {
            print(stdout)
          }
        })
      }
    })
  }
}

module.exports = Migrations
