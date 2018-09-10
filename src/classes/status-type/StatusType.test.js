import test from 'ava'
const StatusType = require('../StatusType.js')

test.before((t) => {
  t.context.StatusType = new StatusType()
})

test('0 is Playing', (t) => {
  t.is(t.context.StatusType.getStatusName(0), 'Playing')
})

test('1 is Streaming', (t) => {
  t.is(t.context.StatusType.getStatusName(1), 'Streaming')
})

test('2 is Listening', (t) => {
  t.is(t.context.StatusType.getStatusName(2), 'Listening')
})

test('3 is Watching', (t) => {
  t.is(t.context.StatusType.getStatusName(3), 'Watching')
})
