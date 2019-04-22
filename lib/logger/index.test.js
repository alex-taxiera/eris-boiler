import test from 'ava'
import sinon from 'sinon'

import logger from '.'

test.beforeEach((t) => {
  t.context.log = sinon.spy(console, 'log')
})

test.afterEach((t) => {
  t.context.log.restore()
})

test.serial('log', (t) => {
  logger.log('normal log...')
  t.true(t.context.log.calledOnce)
})

test.serial('success', (t) => {
  logger.success('success log...')
  t.true(t.context.log.calledOnce)
})

test.serial('warn', (t) => {
  logger.warn('warn log...')
  t.true(t.context.log.calledOnce)
})

test.serial('error', (t) => {
  logger.error('error log...')
  t.true(t.context.log.calledOnce)
})
