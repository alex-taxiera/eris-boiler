import test from 'ava'
import sinon from 'sinon'

import Client from '../DataClient'
import Permission from '../Permission'
import Command from '../Command'
import Event from '../Event'
import Setting from '../Setting'
import {
  promises as fs
} from 'fs'
import path from 'path'
require('dotenv').load()

const mockData = {
  member: {
    permLevel: 0
  },
  defaultTables: {
    anime: 'Another'
  },
  newTables: {
    shows: 'My little pony'
  }
}

const eventData = new Event({
  name: 'test',
  run: () => console.log('test')
})

const setting = new Setting({
  name: 'setting-test-name',
  prettyName: 'settingTestName',
  _onChange: () => {
    console.log('Something in the setting class changed')
  }
})

const permission = new Permission({
  name: 'test-dataclient',
  level: 0,
  check: async member => member === null
})

test.before((t) => {
  t.context.Client = new Client()
})

test.beforeEach((t) => {
  const { Client } = t.context
  t.context.permLoad = sinon.spy(Client, '_permissionLoader')
  t.context.readdir = sinon.spy(fs, 'readdir')
  t.context.selectLoader = sinon.spy(Client, '_selectLoader')
  t.context.loadData = sinon.spy(Client, '_loadData')
  t.context.loadFiles = sinon.spy(Client, '_loadFiles')
  t.context.eventCalled = sinon.spy(Client, 'on')
})

test.afterEach((t) => {
  t.context.permLoad.restore()
  t.context.readdir.restore()
  t.context.selectLoader.restore()
  t.context.loadData.restore()
  t.context.loadFiles.restore()
  t.context.eventCalled.restore()
})

test.serial('member can', async (t) => {
  const {
    member
  } = mockData

  t.is(await t.context.Client.memberCan(member, permission), true)
})

test.serial('permission level', async (t) => {
  const {
    member
  } = mockData
  t.is(await t.context.Client.permissionLevel(member), 0)
})

test.serial('combine tables', (t) => {
  const {
    defaultTables,
    newTables
  } = mockData
  t.deepEqual(t.context.Client._combineTables(defaultTables, newTables), {
    anime: 'Another',
    shows: 'My little pony'
  })
})

test.serial('get dirs', (t) => {
  const dirs = {
    default: {
      permissions: path.join(process.cwd(), `src/permissions/`),
      commands: path.join(process.cwd(), `src/commands/`),
      events: path.join(process.cwd(), `src/events/`),
      settings: path.join(process.cwd(), `src/settings/`),
      toggles: path.join(process.cwd(), `src/toggles/`)
    },
    user: {
      permissions: path.join(process.cwd(), `src/permissions/`),
      commands: path.join(process.cwd(), `src/commands/`),
      events: path.join(process.cwd(), `src/events/`),
      settings: path.join(process.cwd(), `src/settings/`),
      toggles: path.join(process.cwd(), `src/toggles/`)
    }
  }

  t.deepEqual(t.context.Client._getDirectories('src'), dirs)
})

test.serial('load data', async (t) => {
  const dir = path.join(process.cwd(), `src/permissions/`)
  const files = await fs.readdir(dir)

  t.context.Client._loadData('permissions', files, null, t.context.Client._permissionLoader)
  t.true(t.context.loadFiles.calledOnce)
})

test.serial('load files', async (t) => {
  const map = {
    permissions: path.join(process.cwd(), `src/permissions/`),
    commands: path.join(process.cwd(), `src/commands/`),
    events: path.join(process.cwd(), `src/events/`),
    settings: path.join(process.cwd(), `src/settings/`),
    toggles: path.join(process.cwd(), `src/toggles/`)
  }

  const files = await fs.readdir(map.permissions)

  t.context.Client._loadFiles(map, 'permissions', files, t.context.Client._permissionLoader)
  t.true(t.context.permLoad.called)
})

test.serial('load perm', (t) => {
  t.context.Client._permissionLoader(permission)
  t.is(t.context.Client.permissions.get(permission.name), permission)
})

test.serial('load command', (t) => {
  const command = new Command(t.context.Client, {
    name: 'test-command-name',
    description: 'test-command-desc',
    options: {
      permission: 'Anyone'
    },
    run: function () {
      return `Should return: ${this.name}`
    }
  })

  t.context.Client._commandLoader(() => command)
  t.is(t.context.Client.commands.get(command.name), command)
})

test.serial('load event', (t) => {
  t.context.Client._eventLoader(eventData)
  t.true(t.context.eventCalled.calledOnce)
})

test.serial('load setting', (t) => {
  t.context.Client._settingLoader(setting)
  t.is(t.context.Client['settings'], t.context.Client['settings'])
})

test.serial('select loader', (t) => {
  const loaders = {
    permissions: t.context.Client._permissionLoader,
    commands: t.context.Client._commandLoader,
    events: t.context.Client._eventLoader,
    settings: t.context.Client._settingLoader,
    toggles: t.context.Client._settingLoader
  }
  for (const loader in loaders) {
    t.is(t.context.Client._selectLoader(loader), loaders[loader])
  }
})
