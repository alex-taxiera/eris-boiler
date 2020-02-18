const { exec } = require('child_process')

const { Action } = require('.')

const { print } = require('../functions')

class Initialize extends Action {
  constructor () {
    super({
      name: 'init',
      async run (params) {
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
