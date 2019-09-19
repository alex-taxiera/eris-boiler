const {
  Collection
} = require('eris')

class ExtendedCollection extends Collection {
  sort (fn) {
    return Array.from(this.values()).sort(fn)
  }

  reduce (fn) {
    let res
    for (const val of this.values()) {
      res = fn(res, val)
    }
    return res
  }
}

module.exports = ExtendedCollection
