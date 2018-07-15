import test from 'ava'
import sinon from 'sinon'
import Orator from '../Orator'

import Client from '../DataClient'
import Command from '../Command'
import Permission from '../Permission'
import Logger from '../Logger'
const clientConf = require('../../../config/sample.config.json')

const client = new Client(clientConf);

const permission = new Permission({
    name: 'Guild Owner',
    level: 80,
    check: async member => member === null
})

client.permissions.set(permission.name, permission)

const command = new Command(client, {
    name: 'test',
    description: 'test description',
    run: () => console.log('hi'),
    options: {
        permission: 'Guild Owner'
    }
})

test.before(t => {
    t.context.Orator = new Orator(Logger);
})

test.beforeEach(t => {
    t.context.log = sinon.spy(console, 'log')
    client.commands.set(command.name, command)
})

test.afterEach(t => {
    t.context.log.restore()
    client.permissions.delete(permission.name)
    client.commands.delete(command.name)
})

test.serial('canExecute', async t => {
    t.is(await t.context.Orator._canExecute(client, command, ['test'], permission, {
        member: null
    }), true)
})

test.serial('getCommand', t => {
    t.is(t.context.Orator._getCommand(client, 'test'), command)
})

test.serial('Command by user', t => {
    const msg = {
        content: '!test',
        member: {
            id: 'testing_id'
        }
    }
    const mockClient = {
        user: {
            id: 'other_testing_id'
        }
    }
    t.is(t.context.Orator._isCommandByUser(mockClient, msg, '!'), true)
})

test.serial('Is guild', t => {
    const msg = {
        channel: {
            guild: true
        }
    }
    t.is(t.context.Orator._isGuild(msg), true)
})

test.serial('Parse response', t => {
    const resp = {
        content: null,
        embed: null,
        file: null
    };
    t.deepEqual(t.context.Orator._parseResponse(resp), {
        content: {
            content: '',
            embed: null
        },
        file: null
    })
})

test.serial('Speed logs', async t => {
    t.context.Orator._start = 0
    t.context.Orator._speedLog('test')
    t.true(t.context.log.calledOnce)
})