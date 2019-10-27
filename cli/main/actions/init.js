const { Action } = require('.')

const { exec } = require('child_process')
const { resolve } = require('path')
const { copy } = require('fs-extra')

const { print } = require('../functions')

class Initialize extends Action {
  constructor () {
    super({
      name: 'init',
      async run (params) {
        print('Importing the template...\n')

        const templateDir = resolve(__dirname, '..', 'templates')
        const userDir = resolve(process.cwd())

        copy(templateDir, userDir)

        print('Loading package.json\n')
        exec('npm init -y', (error, stdout, stderr) => {
          if (error) {
            return print(error.toString())
          } else {
            print(stdout)
            print('Installing dependencies\n')
            exec('npm install eris eris-boiler', (error, stdout, stderr) => {
              if (error) {
                return print(error.toString())
              } else {
                print(stdout)
              }
            })
          }
        })
      }
    })
  }
}

module.exports = Initialize
