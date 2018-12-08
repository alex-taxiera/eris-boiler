import test from 'ava'

import Permission from '.'
const mockPermData = {
  name: 'test-perm',
  level: 0
}

test.before((t) => {
  t.context.Permission = new Permission(mockPermData)
})

test('Deny permission', (t) => {
  t.is(t.context.Permission.deny, 'Must be test-perm!')
})
