import test from 'ava'
import sinon from 'sinon'

import path from 'path'
import {
  promises as fs
} from 'fs'

import {
  DataClient,
  Permission,
  Command,
  Event,
  Setting
} from '../'

require('dotenv').load()

const mockData = {
  member: {
    permLevel: 0
  },
  defaultTables: [
    {
      name: 'test',
      columns: [
        {
          name: 'testCol',
          type: 'string'
        }
      ]
    }
  ],
  newTables: [
    {
      name: 'test',
      columns: [
        {
          name: 'testCol',
          type: 'boolean',
          default: false
        },
        {
          name: 'newCol',
          type: 'string'
        }
      ]
    },
    {
      name: 'newTable',
      columns: [
        {
          name: 'test',
          type: 'integer'
        }
      ]
    }
  ]
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
  name: 'test-dataDataClient',
  level: 0,
  check: async member => member === null
})

test.before((t) => {
  t.context.DataClient = new DataClient()
})

test.beforeEach((t) => {
  const { DataClient } = t.context
  t.context.permLoad = sinon.spy(DataClient, '_permissionLoader')
  t.context.readdir = sinon.spy(fs, 'readdir')
  t.context.selectLoader = sinon.spy(DataClient, '_selectLoader')
  t.context.loadData = sinon.spy(DataClient, '_loadData')
  t.context.loadFiles = sinon.spy(DataClient, '_loadFiles')
  t.context.eventCalled = sinon.spy(DataClient, 'on')
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

  t.is(await t.context.DataClient.memberCan(member, permission), true)
})

test.serial('permission level', async (t) => {
  const {
    member
  } = mockData
  t.is(await t.context.DataClient.permissionLevel(member), 0)
})

test.serial('combine tables', (t) => {
  const {
    defaultTables,
    newTables
  } = mockData
  const expected = [
    {
      name: 'test',
      columns: [
        {
          name: 'testCol',
          type: 'boolean',
          default: false
        },
        {
          name: 'newCol',
          type: 'string'
        }
      ]
    },
    {
      name: 'newTable',
      columns: [
        {
          name: 'test',
          type: 'integer'
        }
      ]
    }
  ]
  const actual = t.context.DataClient._combineTables(defaultTables, newTables)
  t.is(JSON.stringify(actual), JSON.stringify(expected))
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

  t.deepEqual(t.context.DataClient._getDirectories('src'), dirs)
})

test.serial('load data', async (t) => {
  const dir = path.join(process.cwd(), `src/permissions/`)
  const files = await fs.readdir(dir)

  t.context.DataClient._loadData('permissions', files, null, t.context.DataClient._permissionLoader)
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

  t.context.DataClient._loadFiles(map, 'permissions', files, t.context.DataClient._permissionLoader)
  t.true(t.context.permLoad.called)
})

test.serial('load perm', (t) => {
  t.context.DataClient._permissionLoader(permission)
  t.is(t.context.DataClient.permissions.get(permission.name), permission)
})

test.serial('load command', (t) => {
  const command = new Command(t.context.DataClient, {
    name: 'test-command-name',
    description: 'test-command-desc',
    options: {
      permission: 'Anyone'
    },
    run: function () {
      return `Should return: ${this.name}`
    }
  })

  t.context.DataClient._commandLoader(() => command)
  t.is(t.context.DataClient.commands.get(command.name), command)
})

test.serial('load event', (t) => {
  t.context.DataClient._eventLoader(eventData)
  t.true(t.context.eventCalled.calledOnce)
})

test.serial('load setting', (t) => {
  t.context.DataClient._settingLoader(setting)
  t.is(t.context.DataClient['settings'], t.context.DataClient['settings'])
})

test.serial('select loader', (t) => {
  const loaders = {
    permissions: t.context.DataClient._permissionLoader,
    commands: t.context.DataClient._commandLoader,
    events: t.context.DataClient._eventLoader,
    settings: t.context.DataClient._settingLoader,
    toggles: t.context.DataClient._settingLoader
  }
  for (const loader in loaders) {
    t.is(t.context.DataClient._selectLoader(loader), loaders[loader])
  }
})
