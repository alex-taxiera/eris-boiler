import test from 'ava'
import sinon from 'sinon'
import dotenv from 'dotenv'

import path from 'path'
import {
  promises as fs
} from 'fs'

import {
  DataClient,
  Permission,
  Command,
  Event
} from '../'

dotenv.config()

const mockData = {
  member: {
    permLevel: 0
  }
}

const eventData = new Event({
  name: 'test',
  run: () => console.log('test')
})

const permission = new Permission({
  name: 'test-dataDataClient',
  level: 0,
  check: async (member) => member === null
})

test.before((t) => {
  t.context.DataClient = new DataClient()
})

test('permission level', async (t) => {
  const {
    member
  } = mockData
  t.is(await t.context.DataClient.permissionLevel(member), 0)
})

test('get dirs', (t) => {
  const dirs = {
    default: {
      permissions: path.join(process.cwd(), `boiler/permissions`),
      commands: path.join(process.cwd(), `boiler/commands`),
      events: path.join(process.cwd(), `boiler/events`)
    },
    user: {
      permissions: path.join(process.cwd(), `boiler/permissions`),
      commands: path.join(process.cwd(), `boiler/commands`),
      events: path.join(process.cwd(), `boiler/events`)
    }
  }

  t.deepEqual(t.context.DataClient._getDirectories(path.join(process.cwd(), 'boiler')), dirs)
})

test('load data', async (t) => {
  const dir = path.join(process.cwd(), `boiler/permissions/`)
  const files = await fs.readdir(dir)

  const loadFilesSpy = sinon.spy(t.context.DataClient, '_loadFiles')
  t.context.DataClient._loadData('permissions', files, null, t.context.DataClient._permissionLoader)
  t.true(loadFilesSpy.calledOnce)
})

test('load files', async (t) => {
  const map = {
    permissions: path.join(process.cwd(), `boiler/permissions/`),
    commands: path.join(process.cwd(), `boiler/commands/`),
    events: path.join(process.cwd(), `boiler/events/`),
    settings: path.join(process.cwd(), `boiler/settings/`),
    toggles: path.join(process.cwd(), `boiler/toggles/`)
  }

  const files = await fs.readdir(map.permissions)
  const permSpy = sinon.spy(t.context.DataClient, '_permissionLoader')
  t.context.DataClient._loadFiles(map, 'permissions', files, t.context.DataClient._permissionLoader)
  t.true(permSpy.called)
})

test('load perm', (t) => {
  t.context.DataClient._permissionLoader(permission)
  t.is(t.context.DataClient.permissions.get(permission.name), permission)
})

test('load command', (t) => {
  const command = new Command({
    name: 'test-command-name',
    description: 'test-command-desc',
    options: {
      permission: 'Anyone'
    },
    run: function () {
      return `Should return: ${this.name}`
    }
  })

  t.context.DataClient._commandLoader(command)
  t.is(t.context.DataClient.commands.get(command.name), command)
})

test('load event', (t) => {
  const eventSpy = sinon.spy(t.context.DataClient, 'on')
  t.context.DataClient._eventLoader(eventData)
  t.true(eventSpy.calledOnce)
})

test('select loader', (t) => {
  const loaders = {
    permissions: t.context.DataClient._permissionLoader,
    commands: t.context.DataClient._commandLoader,
    events: t.context.DataClient._eventLoader
  }
  for (const loader in loaders) {
    t.is(t.context.DataClient._selectLoader(loader), loaders[loader])
  }
})
