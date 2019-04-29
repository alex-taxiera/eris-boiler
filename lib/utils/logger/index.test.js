import test from 'ava'
import sinon from 'sinon'

import colors from 'colors/safe'

import logger from './'

test.beforeEach((t) => {
  t.context.consoleSpy = sinon.spy(console, 'log')
  t.context.logSpy = sinon.spy(logger, 'log')
})

test.afterEach((t) => {
  t.context.consoleSpy.restore()
  t.context.logSpy.restore()
})

test.serial('log', (t) => {
  const content = 'normal log...'
  t.true(
    logger.log(content).includes(' | ' + colors.white(content))
  )
  t.true(t.context.consoleSpy.calledOnce)
})

test.serial('success', (t) => {
  const content = 'success log...'
  logger.success(content)
  t.true(t.context.logSpy.calledOnce)
  t.true(t.context.logSpy.calledWith(content, 'green'))
})

test.serial('warn', (t) => {
  const content = 'warn log...'
  logger.warn(content)
  t.true(t.context.logSpy.calledOnce)
  t.true(t.context.logSpy.calledWith(content, 'yellow'))
})

test.serial('error', (t) => {
  const content = 'error log...'
  logger.error(content)
  t.true(t.context.logSpy.calledOnce)
  t.true(t.context.logSpy.calledWith(content, 'red'))
})
