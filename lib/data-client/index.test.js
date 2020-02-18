import test from 'ava'
import sinon from 'sinon'
import { join } from 'path'

import {
  Client
} from 'eris'

import DataClient from '.'
import { ExtendedMap } from '../../util'
import esmCommand from './test-files/esm'

const fakeDatabaseManager = {
  newQuery: (type) => {
    switch (type) {
      case 'guild': return { find: async () => [ { id: '123' } ] }
      default : return { find: async () => null }
    }
  },
  newObject: (type) => {
    switch (type) {
      default: return {
        id: null,
        _data: {},
        save: async function (data) {
          if (data.id) {
            this.id = data.id
          }
          Object.assign(this._data, data)
          return this
        }
      }
    }
  }
}

const buildClient = (options = {
  erisOptions: {
    autoreconnect: true
  }
}) => {
  if (options) {
    return new DataClient('abc', options)
  } else {
    return new DataClient('abc')
  }
}

test('connect/calls loaders and super.connect', async (t) => {
  const client = buildClient(null) // passing null to cover branches
  const connectStub = sinon.stub(Client.prototype, 'connect')
  const loaderStub = sinon.stub(client, '_loadLoadables')
  await client.connect()
  t.true(connectStub.calledOnce)
  t.is(loaderStub.callCount, 4)
})

test('findCommand/finds a command from passed in commands', (t) => {
  const client = buildClient()
  const command = {
    name: 'test command'
  }
  const commands = new ExtendedMap()
  commands.set(command.name, command)

  t.deepEqual(
    client.findCommand('test command', commands),
    command
  )
})

test('findCommand/finds a command from built in commands', (t) => {
  const client = buildClient()
  const command = {
    name: 'test command'
  }
  client.commands = new ExtendedMap()
  client.commands.set(command.name, command)

  t.deepEqual(
    client.findCommand('test command'),
    command
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

test('_addGuild/saves the guild to db', async (t) => {
  const client = buildClient()
  const guild = { id: '123' }

  const newObjectSpy = sinon.stub(client.dbm, 'newObject')
    .callsFake(fakeDatabaseManager.newObject)

  const res = await client._addGuild(guild)

  t.deepEqual(res._data, { id: '123' })
  t.true(newObjectSpy.calledOnceWithExactly('guild'))
})

test('_addGuild/on error return undefined', async (t) => {
  const client = buildClient()

  sinon.stub(client.dbm, 'newObject')
    .callsFake(() => ({ save: () => Promise.reject(Error('this is fine')) }))

  t.is(await client._addGuild({ id: '123' }), undefined)
})

test('_onGuildCreate/calls _addGuild with new guild', async (t) => {
  const client = buildClient()
  const guild = { id: '123' }

  const addGuildStub = sinon.stub(client, '_addGuild')

  await client._onGuildCreate(guild)

  t.true(addGuildStub.calledOnceWithExactly(guild))
})

test('_onMessageCreate/calls orator process', (t) => {
  const client = buildClient()

  const processStub = sinon.stub(client.ora, 'processMessage')

  client._onMessageCreate('test')

  t.true(processStub.calledOnceWithExactly(client, 'test'))
})

test('_addNewGuilds/adds guilds not in this.guilds', async (t) => {
  const client = buildClient()
  const guilds = [
    { id: '123' },
    { id: 'abc' }
  ]

  sinon.stub(client.dbm, 'newQuery')
    .callsFake(fakeDatabaseManager.newQuery)
  const addGuildStub = sinon.stub(client, '_addGuild')

  for (const guild of guilds) {
    client.guilds.set(guild.id, guild)
  }

  await client._addNewGuilds()

  t.true(addGuildStub.calledOnceWithExactly(guilds[1]))
})

test('_addNewGuilds/adds nothing when no new guilds', async (t) => {
  const client = buildClient()
  const guilds = [
    { id: '123' }
  ]

  sinon.stub(client.dbm, 'newQuery')
    .callsFake(fakeDatabaseManager.newQuery)
  const addGuildStub = sinon.stub(client, '_addGuild')

  for (const guild of guilds) {
    client.guilds.set(guild.id, guild)
  }

  await client._addNewGuilds()

  t.true(addGuildStub.notCalled)
})

test('_setOwner/calls API and sets owner', async (t) => {
  const client = buildClient()
  const owner = { id: 'lol' }

  const getOAuthStub = sinon.stub(client, 'getOAuthApplication')
    .callsFake(() => Promise.resolve({ owner }))

  await client._setOwner()

  t.true(getOAuthStub.calledOnce)
  t.is(client.ownerID, owner.id)
})

test('_loadFiles/loads DataClient', async (t) => {
  const client = buildClient()

  t.deepEqual(await client._loadFiles(__dirname), [ DataClient ])
})

test('_loadFiles/works with esm', async (t) => {
  const client = buildClient()
  const path = join(__dirname, 'test-files/esm.js')

  t.deepEqual(await client._loadFiles(path), [ esmCommand ])
})

test('_loadFiles/handles errors', async (t) => {
  const client = buildClient()
  const path = join(__dirname, 'test-files/broken.js')

  t.deepEqual(await client._loadFiles(path), [])
})

test('_resolveLoadables/works with an array of objects', async (t) => {
  const client = buildClient()
  const arr = [ { id: '123' } ]

  t.deepEqual(await client._resolveLoadables(arr), arr)
})

test('_resolveLoadables/works with objects and paths', async (t) => {
  const client = buildClient()
  const fakeObj = { id: '123' }
  const arr = [ fakeObj, 'path' ]

  const loadFileStub = sinon.stub(client, '_loadFiles')
    .callsFake(() => [ fakeObj ])

  t.deepEqual(
    await client._resolveLoadables(arr),
    [
      fakeObj,
      fakeObj
    ]
  )
  t.true(loadFileStub.calledOnceWithExactly('path'))
})

test('_resolveLoadables/works with a single loadable', async (t) => {
  const client = buildClient()
  const fakeObj = { id: '123' }

  t.deepEqual(await client._resolveLoadables(fakeObj), [ fakeObj ])
})

test('_addLoadables/adds from array', (t) => {
  const client = buildClient()
  const arr = [ 1, 2, 3 ]
  const testClient = client._addLoadables(arr, client._commandsToLoad)

  t.is(client, testClient)
  t.true(arr.every((val) => client._commandsToLoad.includes(val)))
})

test('_addLoadables/works with individual elements and arrays', (t) => {
  const client = buildClient()
  const arr = [ 1, 2, 3 ]
  const rest = [ 4, 5, 6 ]
  const testClient = client._addLoadables(
    [ arr, ...rest ],
    client._commandsToLoad
  )

  t.is(client, testClient)
  t.true([ ...arr, ...rest ]
    .every((val) => client._commandsToLoad.includes(val)))
})

test('_addLoadables/works with a single argument', (t) => {
  const client = buildClient()
  const val = 1
  const testClient = client._addLoadables([ val ], client._commandsToLoad)

  t.is(client, testClient)
  t.true(client._commandsToLoad.includes(val))
})

test('addCommands/passes array to _addLoadables', (t) => {
  const client = buildClient()
  const arr = [ 1, 2, 3 ]

  const addLoadableSpy = sinon.spy(client, '_addLoadables')

  client.addCommands(...arr)

  t.true(addLoadableSpy.calledOnceWithExactly(arr, client._commandsToLoad))
})

test('addEvents/passes array to _addLoadables', (t) => {
  const client = buildClient()
  const arr = [ 1, 2, 3 ]

  const addLoadableSpy = sinon.spy(client, '_addLoadables')

  client.addEvents(...arr)

  t.true(addLoadableSpy.calledOnceWithExactly(arr, client._eventsToLoad))
})

test('addPermissions/passes array to _addLoadables', (t) => {
  const client = buildClient()
  const arr = [ 1, 2, 3 ]

  const addLoadableSpy = sinon.spy(client, '_addLoadables')

  client.addPermissions(...arr)

  t.true(addLoadableSpy.calledOnceWithExactly(arr, client._permissionsToLoad))
})

test('_loadLoadables/loads commands', async (t) => {
  const client = buildClient()
  const commands = [ { name: 'test', aliases: [ 'alias' ] } ]

  sinon.stub(client, '_resolveLoadables')
    .callsFake(() => Promise.resolve(commands))
  const loadCommandSpy = sinon.spy(client, '_loadCommand')

  await client._loadLoadables('commands', client._commandsToLoad)

  t.true(loadCommandSpy.calledWithExactly(commands[0]))
})

test('_loadLoadables/loads events', async (t) => {
  const client = buildClient()
  const events = [ { name: 'test', run: () => null } ]

  sinon.stub(client, '_resolveLoadables')
    .callsFake(() => Promise.resolve(events))
  const loadEventSpy = sinon.spy(client, '_loadEvent')

  await client._loadLoadables('events', client._eventsToLoad)

  t.true(loadEventSpy.calledWithExactly(events[0]))
})

test('_loadLoadables/loads permissions', async (t) => {
  const client = buildClient()
  const permissions = [ { level: 69, run: () => null } ]

  sinon.stub(client, '_resolveLoadables')
    .callsFake(() => Promise.resolve(permissions))
  const loadPermissionSpy = sinon.spy(client, '_loadPermission')

  await client._loadLoadables('permissions', client._permissionsToLoad)

  t.true(loadPermissionSpy.calledWithExactly(permissions[0]))
})

test('_loadLoadables/throws on unknown type', (t) => {
  const type = 'haha'
  const client = buildClient()

  return t.throwsAsync(
    () => client._loadLoadables(type, client._commandsToLoad),
    {
      instanceOf: Error,
      message: `Unknown type: ${type}`
    }
  )
})

test('_loadCommand/loads a command', (t) => {
  const client = buildClient()
  const command = { name: 'testing' }
  client._loadCommand(command)

  t.is(client.commands.get(command.name), command)
})

test('_loadEvent/loads an event', (t) => {
  const client = buildClient()
  const event = { name: 'event test', run: () => null }

  const onSpy = sinon.spy(client, 'on')

  client._loadEvent(event)

  t.true(onSpy.calledOnceWith(event.name))
})
