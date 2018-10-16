import test from 'ava'

import Status from '.'

test('0 is Playing', (t) => {
  const status = new Status('a game', 0)
  t.is(status.activity, 'Playing')
})

test('1 is Streaming', (t) => {
  const status = new Status('a game', 1)
  t.is(status.activity, 'Streaming')
})

test('2 is Listening', (t) => {
  const status = new Status('a song', 2)
  t.is(status.activity, 'Listening to')
})

test('3 is Watching', (t) => {
  const status = new Status('a stream', 3)
  t.is(status.activity, 'Watching')
})
