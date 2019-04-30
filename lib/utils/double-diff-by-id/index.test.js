import test from 'ava'

import doubleDiffById from './'

test('doubleDiffById/equal', (t) =>
  t.deepEqual(
    doubleDiffById([
      { id: 1 },
      { id: 2 }
    ],
    [
      { id: 1 },
      { id: 2 }
    ]),
    [ [], [] ]
  )
)

test('doubleDiffById/second list missing one', (t) =>
  t.deepEqual(
    doubleDiffById([
      { id: 1 },
      { id: 2 }
    ],
    [
      { id: 1 }
    ]),
    [ [ { id: 2 } ], [] ]
  )
)

test('doubleDiffById/first list missing one', (t) =>
  t.deepEqual(
    doubleDiffById([
      { id: 1 }
    ],
    [
      { id: 1 },
      { id: 2 }
    ]),
    [ [], [ { id: 2 } ] ]
  )
)

test('doubleDiffById/both lists missing one', (t) =>
  t.deepEqual(
    doubleDiffById([
      { id: 1 }
    ],
    [
      { id: 2 }
    ]),
    [ [ { id: 1 } ], [ { id: 2 } ] ]
  )
)

test('doubleDiffById/throws on three or more lists', (t) =>
  t.throws(
    () => doubleDiffById([], [], []),
    {
      instanceOf: Error,
      message: '2 many lists 4 me'
    }
  )
)
