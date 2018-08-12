import test from 'ava'
require('dotenv').load()

import Client from '../DataClient'
import Command from '../Command'

const client = new Client()

const commandMock = {
  name: 'test-command-name',
  description: 'test-command-desc',
  options: {
    permission: 'test-command-perm'
  },
  run: function () {
    return `Should return: ${this.name}`
  }
}

test.before((t) => {
  client.permissions.set('test-command-perm', 10)
  t.context.Command = new Command(client, commandMock)
})

test('Command info', (t) => {
  const expected = 'Name: test-command-name\nDescription: test-command-desc'
  t.is(t.context.Command.info, expected)
})
