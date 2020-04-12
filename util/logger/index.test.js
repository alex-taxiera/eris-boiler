import test from 'ava'
import sinon from 'sinon'
import format from 'dateformat'

import chalk from 'chalk'

import logger from './'

const timeFormat = () => chalk.gray(format(Date.now(), 'mm/dd HH:MM:ss'))

test.before((t) => sinon.useFakeTimers(Date.now()))

test('log', (t) => {
  const consoleSpy = sinon.spy(console, 'log')
  const content = 'normal log...'

  t.deepEqual(
    logger.log(content),
    [
      timeFormat(),
      '|',
      chalk.white(content)
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
      chalk.green(content)
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
      chalk.yellow(content)
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
      chalk.red(content)
    ]
  )
})

test('empty log', (t) => {
  t.notThrows(
    () => logger.log()
  )
})
