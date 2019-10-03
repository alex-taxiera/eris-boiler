const {
  Collection
} = require('eris')

class ExtendedCollection extends Collection {
  sort (fn) {
    return Array.from(this.values()).sort(fn)
  }
}

module.exports = ExtendedCollection
