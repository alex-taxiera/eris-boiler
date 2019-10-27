const { Action } = require('.')

const { exec } = require('child_process')

const { print } = require('../functions')

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
        })
      ],
      async run () {
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
