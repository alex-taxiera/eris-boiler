import test from 'ava'

import status from './'

test('getActivity/known', (t) =>
  t.is(
    status.getActivity(0),
    'Playing'
  )
)

test('getActivity/unknown', (t) =>
  t.is(status.getActivity(42), undefined)
)

test('isValidType/known', (t) =>
  t.true(status.isValidType(0))
)

test('isValidType/unknown', (t) =>
  t.false(status.isValidType(42))
)

test('equalStatuses/equal', (t) =>
  t.true(
    status.equalStatuses({
      name: 'Rocket League',
      type: 0
    }, {
      name: 'Rocket League',
      type: 0
    }, {
      name: 'Rocket League',
      type: 0
    })
  )
)

test('equalStatuses/different types', (t) =>
  t.false(
    status.equalStatuses({
      name: 'Rocket League',
      type: 0
    }, {
      name: 'Rocket League',
      type: 1
    }, {
      name: 'Rocket League',
      type: 0
    })
  )
)

test('equalStatuses/different names', (t) =>
  t.false(
    status.equalStatuses({
      name: 'Rocket League',
      type: 0
    }, {
      name: 'Rocket League',
      type: 0
    }, {
      name: 'Overwatch',
      type: 0
    })
  )
)

test('equalStatuses/different names and types', (t) =>
  t.false(
    status.equalStatuses({
      name: 'Rocket League',
      type: 0
    }, {
      name: 'Rocket League',
      type: 1
    }, {
      name: 'Overwatch',
      type: 0
    })
  )
)

test('equalStatuses/undefined when not comparing statuses', (t) =>
  t.is(status.equalStatuses(1, 2), undefined)
)

test('equalStatuses/undefined when only one status', (t) =>
  t.is(
    status.equalStatuses({ name: 'Rocket League', type: 0 }),
    undefined
  )
)
