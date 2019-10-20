import test from 'ava'
import sinon from 'sinon'
import format from 'dateformat'

import colors from 'colors/safe'

import logger from './'

const timeFormat = () => colors.gray(format(Date.now(), 'mm/dd HH:MM:ss'))

test.before((t) => sinon.useFakeTimers(Date.now()))

test('log', (t) => {
  const consoleSpy = sinon.spy(console, 'log')
  const content = 'normal log...'

  t.deepEqual(
    logger.log(content),
    [
      timeFormat(),
      '|',
      colors.white(content)
    ]
  )
  t.true(consoleSpy.calledOnce)
})

test('success', (t) => {
  const content = 'success log...'
  t.deepEqual(
    logger.success(content),
    [
      timeFormat(),
      '|',
      colors.green(content)
    ]
  )
})

test('warn', (t) => {
  const content = 'warn log...'
  t.deepEqual(
    logger.warn(content),
    [
      timeFormat(),
      '|',
      colors.yellow(content)
    ]
  )
})

test('error', (t) => {
  const content = 'error log...'
  t.deepEqual(
    logger.error(content),
    [
      timeFormat(),
      '|',
      colors.red(content)
    ]
  )
})

test('empty log', (t) => {
  t.notThrows(
    () => logger.log()
  )
})
