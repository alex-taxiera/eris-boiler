import test from 'ava'

import Command from './'

const commandMock = {
  name: 'test-command-name',
  description: 'test-command-desc'
}

test.before((t) => {
  t.context.Command = new Command(commandMock)
})

test('Command info', (t) => {
  const expected = 'Name: test-command-name\nDescription: test-command-desc'
  t.is(t.context.Command.info, expected)
})
