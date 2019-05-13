import test from 'ava'
import sinon from 'sinon'

import { Client } from 'eris'

import DataClient from '.'

const buildClient = ({
  sourcePath
} = {}) => new DataClient('abc', {
  sourcePath,
  databaseManager: {
    newQuery: (type) => {
      switch (type) {
        case 'guild': return { find: async () => [ { id: '123' } ] }
        default : return { find: async () => null }
      }
    },
    newObject: (type) => {
      switch (type) {
        default: return {
          _data: {},
          save: async function (data) {
            Object.assign(this._data, data)
            return this
          }
        }
      }
    }
  }
})

test('connect/calls loaders and super.connect', async (t) => {
  const client = buildClient()
  const connectStub = sinon.stub(Client.prototype, 'connect')
  const eventLoaderSpy = sinon.spy(client, '_loadEvents')
  const commandLoaderSpy = sinon.spy(client, '_loadCommands')
  await client.connect()
  t.true(connectStub.calledOnce)
  t.true(eventLoaderSpy.calledOnce)
  t.true(commandLoaderSpy.calledOnce)
})

test('findCommand/finds a command from passed in commands', (t) => {
  const client = buildClient()
  const command = {
    name: 'test command'
  }
  const commands = new Map([ [ command.name, command ] ])
  t.deepEqual(
    client.findCommand('test command', { commands }),
    { bot: client, command }
  )
})

test('findCommand/finds a command with aliases passed in', (t) => {
  const client = buildClient()
  const command = {
    name: 'test command',
    aliases: [ 'alias' ]
  }
  const commands = new Map([ [ command.name, command ] ])
  const aliases = new Map([ [ command.aliases[0], command.name ] ])
  t.deepEqual(
    client.findCommand('alias', { commands, aliases }),
    { bot: client, command }
  )
})

test('findCommand/finds a command from built in commands', (t) => {
  const client = buildClient()
  const command = {
    name: 'test command'
  }
  client.commands = new Map([ [ command.name, command ] ])
  t.deepEqual(
    client.findCommand('test command'),
    { bot: client, command }
  )
})

test('findCommand/returns undefined if no command found', (t) => {
  const client = buildClient()

  t.is(client.findCommand('command'), undefined)
})

test('_onReady/calls setup functions', (t) => {
  const client = buildClient()
  const newGuildsStub = sinon.stub(client, '_addNewGuilds')
  const setOwnerStub = sinon.stub(client, '_setOwner')
  const smInitStub = sinon.stub(client.sm, 'initialize')
  client._onReady()
  t.true(newGuildsStub.calledOnce)
  t.true(setOwnerStub.calledOnce)
  t.true(smInitStub.calledOnce)
})

test('_onGuildCreate/saves the guild to db', async (t) => {
  const client = buildClient()
  const guild = { id: '123' }

  const newObjectSpy = sinon.spy(client.dbm, 'newObject')

  const res = await client._onGuildCreate(guild)
  t.deepEqual(res._data, { id: '123' }
  )
  t.true(newObjectSpy.calledOnceWithExactly('guild'))
})

test('_onMessageCreate/calls orator process', (t) => {
  const client = buildClient()
  const processStub = sinon.stub(client.ora, 'processMessage')
  client._onMessageCreate('test')
  t.true(processStub.calledOnceWithExactly(client, 'test'))
})
