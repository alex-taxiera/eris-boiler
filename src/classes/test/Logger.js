import test from 'ava'
import sinon from 'sinon'
import Logger from '../Logger'

test.before(t => {
  t.context.Logger = new Logger()
})

test.beforeEach(t => {
  t.context.log = sinon.spy(console, 'log')
})

test.afterEach(t => {
  t.context.log.restore()
})

test.serial('log', t => {
  t.context.Logger.log('normal log...')
  t.true(t.context.log.calledOnce)
})

test.serial('success', t => {
  t.context.Logger.success('success log...')
  t.true(t.context.log.calledOnce)
})

test.serial('warn', t => {
  t.context.Logger.warn('warn log...')
  t.true(t.context.log.calledOnce)
})

test.serial('error', t => {
  t.context.Logger.error('error log...')
  t.true(t.context.log.calledOnce)
})
