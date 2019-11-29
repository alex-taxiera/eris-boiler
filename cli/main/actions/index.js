const fs = require('fs').promises
const path = require('path')

class Action {
  constructor ({ name, run, subActions }) {
    this.name = name
    this.run = run
    this.subActions = subActions
  }
}

module.exports.Action = Action

module.exports.LoadActions = async () => {
  let acts = []

  const files = await fs.readdir(path.join(__dirname))

  for (const f of files) {
    const fname = f.split('.')[0]

    if (fname === 'index') {
      continue
    }

    acts.push(f)
  }

  return acts
}

module.exports.GetAction = async (acts, action) => {
  let desiredAction

  for (const act of acts) {
    const a = new (require(path.join(__dirname, act)))()

    if (a.name === action) {
      desiredAction = a
    } else {
      continue
    }
  }

  return desiredAction
}
