import test from 'ava'

import Permission from '.'
const mockPermData = {
  name: 'test-perm',
  level: 0
}

test.before((t) => {
  t.context.Permission = new Permission(mockPermData)
})

test('deny', (t) => {
  t.is(
    t.context.Permission.deny,
    `Must be at least ${mockPermData.name}! (level ${mockPermData.level})`)
})
