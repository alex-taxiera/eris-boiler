import test from 'ava'

import DatabaseManager from './'

/* NOT IMPLEMENTED IN DBM */

function notImplemented (t, fnName) {
  const dbm = new DatabaseManager()
  return t.throwsAsync(
    () => dbm[fnName](),
    {
      instanceOf: Error,
      message: 'not yet implemented'
    }
  )
}

notImplemented.title = (_, fnName) => `${fnName}/throws not implemented`

test(notImplemented, 'add')
test(notImplemented, 'delete')
test(notImplemented, 'update')
test(notImplemented, 'get')
test(notImplemented, 'find')
