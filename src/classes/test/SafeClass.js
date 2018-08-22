import test from 'ava'

import SafeClass from '../SafeClass'

test.before((t) => {
  t.context.SafeClass = new SafeClass({ name: 'Another' }, { name: 'My little pony' })
})

test('check data types', (t) => {
  const errors = ['Another is not an anime', 'My little pony is not a show']
  t.throws(() => {
    t.context.SafeClass._checkDataTypes()
  }, null, `'\n\t\t\u0020'${errors.join('\n\t\t\u0020')}`)
})

test('restraint error', (t) => {
  t.is(t.context.SafeClass._restraintError('test-setting', new Map().set('setting-test', 'lol'), 'test-setting-class'), '"test-setting" expects one of [setting-test] but was given "test-setting-class"')
})

test('type error', (t) => {
  const params = ['test-setting', 'test-setting-data', 'test-setting-form']
  const expects = '"test-setting" expects type "test-setting-data" but was given type "test-setting-form"'
  t.is(t.context.SafeClass._typeError(...params), expects)
})

test('happy path', (t) => {
  const shows = { show: new Map().set('shows', 'My little pony') }
  const HappyPath = class HappyPath extends SafeClass {
    constructor () {
      super({}, shows)
    }
  }

  const hp = new HappyPath()
  t.is(hp._checkDataTypes(), undefined)
})
