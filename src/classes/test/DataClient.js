import test from 'ava'
import sinon from 'sinon'
require('dotenv').load()

import Client from '../DataClient'
import Permission from '../Permission'
import Command from '../Command'
import Event from '../Event'
import Setting from '../Setting'
import {
    promises as fs
} from 'fs'
import path from 'path'

const mockData = {
    member: {
        permLevel: 0,
    },
    defaultTables: {
        anime: 'Another'
    },
    newTables: {
        shows: 'My little pony'
    }
}

const eventData = new Event({ 
    name: 'test' ,
    run: () => console.log('test')
})

const setting = new Setting({
    name: 'setting-test-name',
    prettyName: 'settingTestName',
    _onChange: () => {
        console.log('Something in the setting class changed');
    }
})

const permission = new Permission({
    name: 'test-dataclient',
    level: 0,
    check: async member => member === null
})

test.before((t) => {
    t.context.Client = new Client();
})

test.beforeEach((t) => {
    const {
        Client
    } = t.context;
    t.context.log = sinon.spy(console, 'log')
    t.context.loadData = sinon.spy(Client, '_loadData')
    t.context.permLoad = sinon.spy(Client, '_permissionLoader')
    t.context.cmdLoad = sinon.spy(Client, '_commandLoader')
    t.context.eventLoad = sinon.spy(Client, '_eventLoader')
    t.context.settingLoad = sinon.spy(Client, '_settingLoader')
    t.context.setup = sinon.spy(Client, '_setup')
})

test.afterEach((t) => {
    t.context.log.restore()
    t.context.loadData.restore()
    t.context.permLoad.restore()
    t.context.cmdLoad.restore()
    t.context.eventLoad.restore()
    t.context.settingLoad.restore()
    t.context.setup.restore()
})

test.serial('member can', async (t) => {
    const {
        member
    } = mockData;

    t.is(await t.context.Client.memberCan(member, permission), true)
})

test.serial('permission level', async (t) => {
    const {
        member
    } = mockData;
    t.is(await t.context.Client.permissionLevel(member), 0)
})

test.serial('combine tables', (t) => {
    const {
        defaultTables,
        newTables
    } = mockData;
    t.deepEqual(t.context.Client._combineTables(defaultTables, newTables), {
        anime: 'Another',
        shows: 'My little pony'
    })
})

test.serial('get dirs', (t) => {
    t.deepEqual(t.context.Client._getDirectories('src'), {
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
    })
})

test.serial('load data', async (t) => {
    const dir = path.join(process.cwd(), `src/permissions/`)
    const files = await fs.readdir(dir)

    t.context.Client._loadData(dir, files, null, t.context.Client._permissionLoader)
    t.true(t.context.loadData.calledOnce)
})

test.serial('load files', async (t) => {
    let map = {
        permissions: path.join(process.cwd(), `src/permissions/`),
        commands: path.join(process.cwd(), `src/commands/`),
        events: path.join(process.cwd(), `src/events/`),
        settings: path.join(process.cwd(), `src/settings/`),
        toggles: path.join(process.cwd(), `src/toggles/`)
    }

    const files = await fs.readdir(map.permissions)

    t.context.Client._loadFiles(map, 'throw', files, t.context.Client._permissionLoader)
    t.true(t.context.log.called)
})

test.serial('load perm', (t) => {
    t.context.Client._permissionLoader(permission)
    t.true(t.context.permLoad.calledOnce)
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

    t.context.Client._commandLoader((() => command))
    t.true(t.context.cmdLoad.calledOnce)
})

test.serial('load event', (t) => {
    t.context.Client._eventLoader(eventData)
    t.true(t.context.eventLoad.calledOnce)
})

test.serial('load setting', (t) => {
    t.context.Client._settingLoader(setting)
    t.true(t.context.settingLoad.calledOnce)
})

test.serial('select loader', (t) => {
    let perm = t.context.Client._permissionLoader
    t.is(t.context.Client._selectLoader('permissions'), perm)
})

test.serial('setup', (t) => {
    t.context.Client._setup()
    t.true(t.context.setup.calledOnce)
})