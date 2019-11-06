const { Action } = require('.')

const { exec } = require('child_process')
const { resolve } = require('path')
const { copyFiles } = require('../functions')

const { print } = require('../functions')

class Initialize extends Action {
  constructor () {
    super({
      name: 'init',
      async run (params) {
        print('Importing the template...')

        const templateDir = resolve(__dirname, '..', 'migrations')
        const userDir = resolve(process.cwd())

        copyFiles(templateDir, userDir)

        print('Loading package.json')
        exec('npm init -y', (error, stdout, stderr) => {
          if (error) {
            return print(error.toString())
          } else {
            print(stdout)
            print('Installing dependencies')
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
